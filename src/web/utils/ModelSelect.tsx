import { Button, MenuItem } from "@blueprintjs/core";
import { ItemPredicate, ItemRenderer, Select } from "@blueprintjs/select";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ModelInfo } from "../../electron_api";
import { useModelList } from "./ModelList";

const filterModel: ItemPredicate<ModelInfo> = (query, model, _index, exactMatch) => {
    const normalizedTitle = model.name.toLowerCase();
    const normalizedQuery = query.toLowerCase();

    if (exactMatch) {
        return normalizedTitle === normalizedQuery;
    } else {
        return `${model.name}. ${normalizedTitle} ${model.model}`.indexOf(normalizedQuery) >= 0;
    }
};

const renderModel: ItemRenderer<ModelInfo> = (model, { handleClick, handleFocus, modifiers, query }) => {
    if (!modifiers.matchesPredicate) {
        return null;
    }
    return (
        <MenuItem
            active={modifiers.active}
            disabled={modifiers.disabled}
            key={model.digest}
            label={model.modified}
            onClick={handleClick}
            onFocus={handleFocus}
            roleStructure="listoption"
            text={`${model.name}`}
        />
    );
};

export interface ModelSelectProps {
    onModelSelect: (model: ModelInfo) => void;
}


export const ModelSelect: React.FC<ModelSelectProps> = ( props ) => {
    const modelList = useModelList();
    const [selectedModel, setSelectedModel] = React.useState<ModelInfo | undefined>();
    const handleItemSelect = (item: ModelInfo, event?: React.SyntheticEvent<HTMLElement, Event>) => {
        setSelectedModel(item);
        props.onModelSelect(item);
    };

    if (modelList.isLoading) {
        return <div>Loading...</div>;
    }

    if (modelList.error) {
        return <div>Error: {modelList.error}</div>;
    }

    if (!modelList.models) {
        return <div>No models</div>;
    }

    if (modelList.models.length == 0) {
        return <div>No models</div>;
    }

    const firstModel = modelList.models[0] as ModelInfo;

    return (
      <Select
        filterable={true}
        items={modelList.models}
        itemPredicate={filterModel}
        itemRenderer={renderModel}
        noResults={<MenuItem disabled={true} text="No results." roleStructure="listoption" />}
        onItemSelect={handleItemSelect}
      >
          <Button text={selectedModel?.name || firstModel.name} rightIcon="double-caret-vertical" />
      </Select>
    );
};