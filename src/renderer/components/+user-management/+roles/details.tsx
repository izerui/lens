/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import { observer } from "mobx-react";
import React from "react";

import type { Role } from "../../../../common/k8s-api/endpoints";
import { DrawerTitle } from "../../drawer";
import type { KubeObjectDetailsProps } from "../../kube-object-details";
import { KubeObjectMeta } from "../../kube-object-meta";

interface Props extends KubeObjectDetailsProps<Role> {
}

@observer
export class RoleDetails extends React.Component<Props> {
  render() {
    const { object: role } = this.props;

    if (!role) return null;
    const rules = role.getRules();

    return (
      <div className="RoleDetails">
        <KubeObjectMeta object={role}/>
        <DrawerTitle title="Rules"/>
        {rules.map(({ resourceNames, apiGroups, resources, verbs }, index) => {
          return (
            <div className="rule" key={index}>
              {resources && (
                <>
                  <div className="name">Resources</div>
                  <div className="value">{resources.join(", ")}</div>
                </>
              )}
              {verbs && (
                <>
                  <div className="name">Verbs</div>
                  <div className="value">{verbs.join(", ")}</div>
                </>
              )}
              {apiGroups && (
                <>
                  <div className="name">Api Groups</div>
                  <div className="value">
                    {apiGroups
                      .map(apiGroup => apiGroup === "" ? `'${apiGroup}'` : apiGroup)
                      .join(", ")
                    }
                  </div>
                </>
              )}
              {resourceNames && (
                <>
                  <div className="name">Resource Names</div>
                  <div className="value">{resourceNames.join(", ")}</div>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  }
}
