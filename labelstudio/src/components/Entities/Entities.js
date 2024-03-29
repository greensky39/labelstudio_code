import React, { useState } from "react";
import { Dropdown } from "antd";
import { observer } from "mobx-react";

import "./Entities.scss";
import { RegionTree } from "./RegionTree";
import { LabelList } from "./LabelList";
import { SortMenu, SortMenuIcon } from "./SortMenu";
import { Oneof } from "../../common/Oneof/Oneof";
import { Space } from "../../common/Space/Space";
import { Block, Elem } from "../../utils/bem";
import { RadioGroup } from "../../common/RadioGroup/RadioGroup";
import "./Entities.styl";
import { Button } from "../../common/Button/Button";
import { LsInvisible, LsTrash, LsVisible } from "../../assets/icons";
import { confirm } from "../../common/Modal/Modal";
import { Tooltip } from "../../common/Tooltip/Tooltip";

export default observer(({ regionStore, annotation }) => {
  const { classifications, regions } = regionStore;
  const count = regions.length + (regionStore.view === "regions" ? classifications.length : 0);

  const toggleVisibility = e => {
    e.preventDefault();
    e.stopPropagation();
    regionStore.toggleVisibility();
  };

  return (
    <Block name="entities">
      <Elem name="source">
        <Space spread>
          <RadioGroup
            size="small"
            value={regionStore.view}
            style={{ width: 240 }}
            onChange={e => {
              regionStore.setView(e.target.value);
            }}
          >
            <RadioGroup.Button value="regions">
              Regions{count ? <Elem name="counter">&nbsp;{count}</Elem> : null}
              {console.log("regionStore.view :", regionStore.view)}
            </RadioGroup.Button>
            <RadioGroup.Button value="labels">Labels</RadioGroup.Button>
          </RadioGroup>

          <Tooltip title="Delete All Regions">
            <Button
              look="danger"
              type="text"
              aria-label="Delete All Regions"
              icon={<LsTrash />}
              style={{
                height: 36,
                width: 36,
                padding: 0,
              }}
              onClick={() => {
                confirm({
                  title: "Removing all regions",
                  body: "Do you want to delete all annotated regions?",
                  buttonLook: "destructive",
                  onOk: () => annotation.deleteAllRegions(),
                });
              }}
            />
          </Tooltip>
        </Space>
      </Elem>
      <Elem name="checkbox">
        {/* <input type="checkbox" onChange={e => regionStore.setMultiSelection(e.target.checked)} /> {"Multiple Selection"} */}
        {"Multiple Selection"}
        <RadioGroup
          size="small"
          value={regionStore.multiSelection}
          style={{ width: 240 }}
          onChange={e => {
            regionStore.setMultiSelection(e.target.value);
          }}
        >
          <RadioGroup.Button value="false">Off</RadioGroup.Button>
          <RadioGroup.Button value="true">On</RadioGroup.Button>
        </RadioGroup>
      </Elem>

      {count ? (
        <Elem name="header">
          <Space spread align={regionStore.view === "regions" ? null : "end"}>
            {regionStore.view === "regions" && (
              <Dropdown overlay={<SortMenu regionStore={regionStore} />} placement="bottomLeft">
                <Elem name="sort" onClick={e => e.preventDefault()}>
                  <Elem name="sort-icon">
                    <SortMenuIcon sortKey={regionStore.sort} />
                  </Elem>{" "}
                  {`Sorted by ${regionStore.sort[0].toUpperCase()}${regionStore.sort.slice(1)}`}
                </Elem>
              </Dropdown>
            )}

            <Space size="small" align="end">
              {regions.length > 0 ? (
                <Elem
                  name="visibility"
                  tag={Button}
                  size="small"
                  type="link"
                  style={{ padding: 0 }}
                  onClick={toggleVisibility}
                  mod={{ hidden: regionStore.isAllHidden }}
                >
                  {regionStore.isAllHidden ? <LsInvisible /> : <LsVisible />}
                </Elem>
              ) : null}
            </Space>
          </Space>
        </Elem>
      ) : null}

      <Oneof value={regionStore.view}>
        <Elem name="regions" case="regions">
          {count ? <RegionTree regionStore={regionStore} /> : <Elem name="empty">No Regions created yet</Elem>}
          {/* <button onClick={() => console.log("좌표버튼 클릭")} >좌표 버튼</button> */}
          {/* <button onClick={Test}>테스트버튼</button> */}
          {/* <input type="checkbox"></input> */}
        </Elem>
        <Elem name="labels" case="labels">
          {count ? <LabelList regionStore={regionStore} /> : <Elem name="empty">No Labeled Regions created yet</Elem>}
        </Elem>
      </Oneof>
    </Block>
  );
});
