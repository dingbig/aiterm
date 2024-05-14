import { Button, MenuItem } from "@blueprintjs/core";
import { ItemPredicate, ItemRenderer, Select } from "@blueprintjs/select";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Model } from "../../electron_api";
import { useModelList } from "./ModelList";

const filterModel: ItemPredicate<Model> = (query, model, _index, exactMatch) => {
    const normalizedTitle = model.name.toLowerCase();
    const normalizedQuery = query.toLowerCase();

    if (exactMatch) {
        return normalizedTitle === normalizedQuery;
    } else {
        return `${model.rank}. ${normalizedTitle} ${model.year}`.indexOf(normalizedQuery) >= 0;
    }
};

const renderModel: ItemRenderer<Model> = (model, { handleClick, handleFocus, modifiers, query }) => {
    if (!modifiers.matchesPredicate) {
        return null;
    }
    return (
        <MenuItem
            active={modifiers.active}
            disabled={modifiers.disabled}
            key={model.rank}
            label={model.year.toString()}
            onClick={handleClick}
            onFocus={handleFocus}
            roleStructure="listoption"
            text={`${model.rank}. ${model.name}`}
        />
    );
};


const ModelSelect: React.FC = () => {
    const modelList = useModelList();
    const [selectedModel, setSelectedModel] = React.useState<Model | undefined>();
    const handleItemSelect = (item: Model, event?: React.SyntheticEvent<HTMLElement, Event>) => {
        setSelectedModel(item);
    };
    React.useEffect(()=> {
        modelList.reloadModels();
    }, []);
    return (
        <Select<Model>
            items={modelList.models}
            itemPredicate={filterModel}
            itemRenderer={renderModel}
            noResults={<MenuItem disabled={true} text="No results." roleStructure="listoption" />}
            onItemSelect={handleItemSelect}
        >
            <Button text={selectedModel?.name} rightIcon="double-caret-vertical" placeholder="Select a film" />
        </Select>
    );
};
