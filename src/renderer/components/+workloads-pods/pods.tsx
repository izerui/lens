/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// import "./pods.scss";

import React, { Fragment, HTMLProps } from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { Link } from "react-router-dom";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import type { NodeApi, Pod } from "../../../common/k8s-api/endpoints";
import { StatusBrick } from "../status-brick";
import { cssNames, Disposer, getConvertedParts, object, stopPropagation } from "../../utils";
import startCase from "lodash/startCase";
import kebabCase from "lodash/kebabCase";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { Badge } from "../badge";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { GetDetailsUrl } from "../kube-detail-params/get-details-url.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import getDetailsUrlInjectable from "../kube-detail-params/get-details-url.injectable";
import type { EventStore } from "../+events/store";
import type { PodStore } from "./store";
import nodeApiInjectable from "../../../common/k8s-api/endpoints/node.api.injectable";
import eventStoreInjectable from "../+events/store.injectable";
import podStoreInjectable from "./store.injectable";
import { List } from "../list/list";
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table'
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";

enum columnId {
  name = "name",
  namespace = "namespace",
  containers = "containers",
  restarts = "restarts",
  age = "age",
  qos = "qos",
  node = "node",
  owners = "owners",
  status = "status",
}

interface Dependencies {
  getDetailsUrl: GetDetailsUrl;
  apiManager: ApiManager;
  eventStore: EventStore;
  podStore: PodStore;
  nodeApi: NodeApi;
  subscribeToStores: SubscribeStores;
}

const columnHelper = createColumnHelper<Pod>()

@observer
class NonInjectedPods extends React.Component<Dependencies> {
  componentDidMount() {
    const { podStore, eventStore, subscribeToStores } = this.props;
    const stores = Array.from(new Set([podStore, eventStore]));

    const reactions: Disposer[] = [];

    reactions.push(
      subscribeToStores(stores),
    );

    disposeOnUnmount(this, reactions);
  }

  renderState<T extends string>(name: string, ready: boolean, key: string, data: Partial<Record<T, string | number>> | undefined) {
    return data && (
      <>
        <div className="title">
          {name}
          {" "}
          <span className="text-secondary">
            {key}
            {ready ? ", ready" : ""}
          </span>
        </div>
        {object.entries(data).map(([name, value]) => (
          <div key={name} className="flex gaps align-center">
            <div className="name">
              {startCase(name)}
            </div>
            <div className="value">
              {value}
            </div>
          </div>
        ))}
      </>
    );
  }

  renderContainersStatus(pod: Pod) {
    return pod.getContainerStatuses()
      .map(({ name, state = {}, ready }) => (
        <Fragment key={name}>
          <StatusBrick
            className={cssNames(state, { ready })}
            tooltip={{
              formatters: {
                tableView: true,
              },
              children: (
                <>
                  {this.renderState(name, ready, "running", state.running)}
                  {this.renderState(name, ready, "waiting", state.waiting)}
                  {this.renderState(name, ready, "terminated", state.terminated)}
                </>
              ),
            }}
          />
        </Fragment>
      ));
  }

  renderControlledBy(pod: Pod) {
    const { apiManager, getDetailsUrl } = this.props;

    return pod.getOwnerRefs().map(ref => {
      const { kind, name } = ref;
      const detailsLink = getDetailsUrl(apiManager.lookupApiLink(ref, pod));

      return (
        <Badge
          flat
          key={name}
          className="owner"
          tooltip={name}
        >
          <Link to={detailsLink} onClick={stopPropagation}>
            {kind}
          </Link>
        </Badge>
      );
    })
  }

  renderNodeName(pod: Pod) {
    const { getDetailsUrl, nodeApi } = this.props;

    return pod.getNodeName() ? (
      <Badge
        flat
        key="node"
        className="node"
        tooltip={pod.getNodeName()}
        expandable={false}
      >
        <Link to={getDetailsUrl(nodeApi.getUrl({ name: pod.getNodeName() }))} onClick={stopPropagation}>
          {pod.getNodeName()}
        </Link>
      </Badge>
    ) : ""
  }

  render() {
    const { podStore } = this.props;

    const columns = [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        ),
        cell: ({ row }) => (
          <div className="px-1">
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
      }),
      columnHelper.accessor(row => row.getName(), {
        id: "name",
        header: "Name",
        cell: info => info.getValue(),
      }),
      columnHelper.display({
        id: "warning",
        cell: props => <KubeObjectStatusIcon key="icon" object={props.row.original} />,
      }),
      columnHelper.accessor(row => row.getNs(), {
        id: "namespace",
        header: "Namespace",
        cell: info => info.getValue(),
      }),
      columnHelper.accessor(row => this.renderContainersStatus(row), {
        id: "containers",
        header: "Containers",
        cell: info => info.getValue(),
      }),
      columnHelper.accessor(row => row.getRestartsCount(), {
        id: "restarts",
        header: "Restarts",
        cell: info => info.getValue(),
      }),
      columnHelper.accessor(row => this.renderControlledBy(row), {
        id: "controlledBy",
        header: "Controlled By",
        cell: info => info.getValue(),
      }),
      columnHelper.accessor(row => this.renderNodeName(row), {
        id: "node",
        header: "Node",
        cell: info => info.getValue(),
      }),
      columnHelper.accessor(row => row.getQosClass(), {
        id: "qos",
        header: "QoS",
        cell: info => info.getValue(),
      }),
      columnHelper.accessor(row => <KubeObjectAge key="age" object={row} />, {
        id: "age",
        header: "Age",
        cell: info => info.renderValue(),
      }),
      columnHelper.accessor(row => row.getStatusMessage(), {
        id: "status",
        header: "Status",
        cell: info => info.getValue(),
      }),
    ]

    return (
      <SiblingsInTabLayout>
        <List
          columns={columns}
          data={podStore.contextItems}
          title="Pods"
          filters={[
            // pod => pod.getSearchFields(),
            pod => pod.getStatusMessage(),
            pod => pod.status?.podIP || "",
            pod => pod.getNodeName() || "",
          ]}
          getCoreRowModel={getCoreRowModel()}
        />
      </SiblingsInTabLayout>
    );
  }

  render1() {
    const { apiManager, getDetailsUrl, podStore, eventStore, nodeApi } = this.props;

    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          className="Pods"
          store={podStore}
          dependentStores={[eventStore]} // status icon component uses event store
          tableId = "workloads_pods"
          isConfigurable
          sortingCallbacks={{
            [columnId.name]: pod => getConvertedParts(pod.getName()),
            [columnId.namespace]: pod => pod.getNs(),
            [columnId.containers]: pod => pod.getContainerStatuses().length,
            [columnId.restarts]: pod => pod.getRestartsCount(),
            [columnId.owners]: pod => pod.getOwnerRefs().map(ref => ref.kind),
            [columnId.qos]: pod => pod.getQosClass(),
            [columnId.node]: pod => pod.getNodeName(),
            [columnId.age]: pod => -pod.getCreationTimestamp(),
            [columnId.status]: pod => pod.getStatusMessage(),
          }}
          searchFilters={[
            pod => pod.getSearchFields(),
            pod => pod.getStatusMessage(),
            pod => pod.status?.podIP,
            pod => pod.getNodeName(),
          ]}
          renderHeaderTitle="Pods"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Containers", className: "containers", sortBy: columnId.containers, id: columnId.containers },
            { title: "Restarts", className: "restarts", sortBy: columnId.restarts, id: columnId.restarts },
            { title: "Controlled By", className: "owners", sortBy: columnId.owners, id: columnId.owners },
            { title: "Node", className: "node", sortBy: columnId.node, id: columnId.node },
            { title: "QoS", className: "qos", sortBy: columnId.qos, id: columnId.qos },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
            { title: "Status", className: "status", sortBy: columnId.status, id: columnId.status },
          ]}
          renderTableContents={pod => [
            <Badge
              flat
              key="name"
              label={pod.getName()}
              tooltip={pod.getName()}
              expandable={false}
            />,
            <KubeObjectStatusIcon key="icon" object={pod} />,
            pod.getNs(),
            this.renderContainersStatus(pod),
            pod.getRestartsCount(),
            pod.getOwnerRefs().map(ref => {
              const { kind, name } = ref;
              const detailsLink = getDetailsUrl(apiManager.lookupApiLink(ref, pod));

              return (
                <Badge
                  flat
                  key={name}
                  className="owner"
                  tooltip={name}
                >
                  <Link to={detailsLink} onClick={stopPropagation}>
                    {kind}
                  </Link>
                </Badge>
              );
            }),
            pod.getNodeName() ? (
              <Badge
                flat
                key="node"
                className="node"
                tooltip={pod.getNodeName()}
                expandable={false}
              >
                <Link to={getDetailsUrl(nodeApi.getUrl({ name: pod.getNodeName() }))} onClick={stopPropagation}>
                  {pod.getNodeName()}
                </Link>
              </Badge>
            )
              : "",
            pod.getQosClass(),
            <KubeObjectAge key="age" object={pod} />,
            { title: pod.getStatusMessage(), className: kebabCase(pod.getStatusMessage()) },
          ]}
        />
      </SiblingsInTabLayout>
    );
  }
}

export const Pods = withInjectables<Dependencies>(NonInjectedPods, {
  getProps: (di, props) => ({
    ...props,
    apiManager: di.inject(apiManagerInjectable),
    getDetailsUrl: di.inject(getDetailsUrlInjectable),
    nodeApi: di.inject(nodeApiInjectable),
    eventStore: di.inject(eventStoreInjectable),
    podStore: di.inject(podStoreInjectable),
    subscribeToStores: di.inject(subscribeStoresInjectable),
  }),
});

function IndeterminateCheckbox({
  indeterminate,
  className = '',
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = React.useRef<HTMLInputElement>(null!)

  React.useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate
    }
  }, [ref, indeterminate])

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className}
      style={{ cursor: "pointer" }}
      {...rest}
    />
  )
}