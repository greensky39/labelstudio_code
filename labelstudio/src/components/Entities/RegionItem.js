import { Badge, List } from "antd";
import { observer } from "mobx-react";
import { isAlive } from "mobx-state-tree";
import { Button } from "../../common/Button/Button";
import { Node, NodeIcon } from "../Node/Node";
import { LsCollapse, LsExpand, LsInvisible, LsSparks, LsVisible } from "../../assets/icons";
import styles from "./Entities.module.scss";
import Utils from "../../utils";

import { Block, Elem } from "../../utils/bem";
import { isDefined } from "../../utils/utilities";
import "./RegionItem.styl";
import { Space } from "../../common/Space/Space";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { asVars } from "../../utils/styles";
import { PER_REGION_MODES } from "../../mixins/PerRegion";
import Registry from "../../core/Registry";
import chroma from "chroma-js";

const RegionItemDesc = observer(({ item, setDraggable }) => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapsed = useCallback(e => {
    setCollapsed(val => !val);
    e.preventDefault();
    e.stopPropagation();
  }, []);
  const controls = item.perRegionDescControls || [];

  return (
    <>
      <Elem
        name="desc"
        tag="div"
        mod={{ collapsed, empty: !(controls?.length > 0) }}
        onMouseEnter={() => {
          setDraggable(false);
        }}
        onMouseLeave={() => {
          setDraggable(true);
        }}
      >
        <Elem name="controls">
          {controls.map((tag, idx) => {
            const View = Registry.getPerRegionView(tag.type, PER_REGION_MODES.REGION_LIST);

            return View ? (
              <View key={idx} item={tag} area={item} collapsed={collapsed} setCollapsed={setCollapsed} />
            ) : null;
          })}
        </Elem>
        <Elem name="collapse" tag={Button} size="small" type="text" onClick={toggleCollapsed}>
          {collapsed ? <LsExpand /> : <LsCollapse />}
        </Elem>
      </Elem>
    </>
  );
});

const RegionItemContent = observer(({ idx, item, setDraggable }) => {
  const itemElRef = useRef();
  const [checkedItems, setCheckedItems] = useState(new Set());

  const checkedItemHandler = (id, isChecked) => {
    if (isChecked) {
      checkedItems.add(id);
      setCheckedItems(checkedItems);
    } else if (!isChecked && checkedItems.has(id)) {
      checkedItems.delete(id);
      setCheckedItems(checkedItems);
    }
  };

  const [bChecked, setChecked] = useState(false);

  const checkHandler = ({ target }) => {
    setChecked(!bChecked);
    checkedItemHandler(item.id, target.checked);
  };

  useEffect(() => {
    // console.log("item:", item);
    if (item.selected) {
      const el = itemElRef.current;

      if (!el) return;
      const scroll = el.scrollIntoViewIfNeeded || el.scrollIntoView;

      scroll.call(el);
      // console.log("it's selected!")
    }
    //  console.log("bCheckdded :", bChecked);
    //  console.log("checkedItemsbChecked", checkedItems);
    console.log("item :", item);
  }, [item.selected]);

  const [multiCheck, setMultiCheck] = useState(false);

  return (
    <>
      <input type="checkbox" checked={multiCheck} onChange={e => setMultiCheck(e)} />
      <Block ref={itemElRef} name="region-item" mod={{ hidden: item.hidden }}>
        <Elem name="header" tag="div">
          {/* checkbox 생성 */}
          <Elem name="checkbox">
            {item.selected && <input type="checkbox" checked={item.selected} onChange={e => checkHandler(e)} />}
            {}
          </Elem>

          <Elem name="counter">{isDefined(idx) ? idx + 1 : ""}</Elem>
          <Elem name="title" tag={Node} node={item} mix={styles.node} />

          <Space size="small">
            <Elem tag="span" name="id">
              <NodeIcon node={item} />
            </Elem>

            <Elem name="prediction">
              {item.origin === "prediction" && <LsSparks style={{ width: 16, height: 16 }} />}
            </Elem>

            {!item.editable && <Badge count={"ro"} style={{ backgroundColor: "#ccc" }} />}

            {item.score && (
              <Elem
                tag="span"
                name="score"
                style={{
                  color: Utils.Colors.getScaleGradient(item.score),
                }}
              >
                {item.score.toFixed(2)}
              </Elem>
            )}

            {item.hideable && (
              <Elem
                tag={Button}
                name="toggle"
                size="small"
                type="text"
                mod={{ active: !item.hidden }}
                onClick={item.toggleHidden}
              >
                {item.hidden ? <LsInvisible /> : <LsVisible />}
              </Elem>
            )}
          </Space>
        </Elem>
        <RegionItemDesc item={item} setDraggable={setDraggable} />
      </Block>
    </>
  );
});

export const RegionItem = observer(({ item, idx, flat, setDraggable, onClick }) => {
  const getVars = useMemo(() => {
    let vars;

    return () => {
      if (!vars) {
        const color = item.getOneColor();

        vars = color ? asVars({ labelColor: color, labelBgColor: chroma(color).alpha(0.15) }) : null;
      }
      return vars;
    };
  }, [isAlive(item) && item.getOneColor()]);

  if (!isAlive(item)) return null;

  const classnames = [
    styles.lstitem,
    flat && styles.flat,
    item.hidden === true && styles.hidden,
    item.inSelection && styles.selected,
  ].filter(Boolean);

  const vars = getVars();

  return (
    <>
      <List.Item
        key={item.id}
        className={classnames.join(" ")}
        onClick={e => {
          onClick(e, item);
        }}
        onMouseOver={() => item.setHighlight(true)}
        onMouseOut={() => item.setHighlight(false)}
        style={vars}
        aria-label="region"
      >
        <RegionItemContent idx={idx} item={item} setDraggable={setDraggable} />
      </List.Item>
    </>
  );
});