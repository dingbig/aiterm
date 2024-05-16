import { Button, Menu, MenuItem } from "@blueprintjs/core";
import { ItemPredicate, ItemRenderer, Select } from "@blueprintjs/select";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Model } from "../../electron_api";
import { useModelList } from "./ModelList";
import type { ItemListRendererProps } from "@blueprintjs/select";


const getInitialContent = () => {
    return this.state.hasInitialContent ? (
        <MenuItem disabled={true} text={`${TOP_100_FILMS.length} items loaded.`} roleStructure="listoption" />
    ) : undefined;
};

const groupedItemListPredicate = (query: string, items: Model[]) => {
    return items
        .filter((item, index) => filterFilm(query, item, index))
        .sort((a, b) => this.getGroup(a).localeCompare(this.getGroup(b)));
};


const renderGroupedItemList = (listProps: ItemListRendererProps<Model>) => {
    const initialContent = getInitialContent();
    const noResults = <MenuItem disabled={true} text="No results." roleStructure="listoption" />;

    // omit noResults if createNewItemFromQuery and createNewItemRenderer are both supplied, and query is not empty
    const createItemView = listProps.renderCreateItem();
    const maybeNoResults = createItemView != null ? null : noResults;

    const menuContent = renderGroupedMenuContent(listProps, maybeNoResults, initialContent);
    if (menuContent == null && createItemView == null) {
        return null;
    }
    const { createFirst } = this.state;
    return (
        <Menu role="listbox" {...listProps.menuProps} ulRef={listProps.itemsParentRef}>
            {createFirst && createItemView}
            {menuContent}
            {!createFirst && createItemView}
        </Menu>
    );
};

export const ModelSelect: React.FC = () => {
    const modelList = useModelList();
    const [selectedModel, setSelectedModel] = React.useState<Model | undefined>();
    const handleItemSelect = (item: Model, event?: React.SyntheticEvent<HTMLElement, Event>) => {
        setSelectedModel(item);
    };
    React.useEffect(()=> {
        modelList.reloadModels();
    }, []);
    return (
        <Select>
            items={modelList.models}
            itemListRenderer={renderGroupedItemList}
            itemListPredicate={groupedItemListPredicate}
            noResults={<MenuItem disabled={true} text="No results." roleStructure="listoption" />}
            onItemSelect={handleItemSelect}
            <Button text={selectedModel?.name} rightIcon="double-caret-vertical" />
        </Select>
    );
};
