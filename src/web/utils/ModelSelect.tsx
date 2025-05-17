import { Button, MenuItem } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import { ModelInfo } from '../../electron_api';
import { useModelList } from './ModelList';
import React from 'react';

interface ModelSelectProps {
  onModelSelect: (model: ModelInfo) => void;
  disabled?: boolean;
}

const ModelSelect = Select.ofType<ModelInfo>();

export const ModelSelectComponent: React.FC<ModelSelectProps> = ({ onModelSelect, disabled }) => {
  const modelList = useModelList();
  const [selectedModel, setSelectedModel] = React.useState<ModelInfo | undefined>();

  const renderModel = (model: ModelInfo, { handleClick }: { handleClick: (event: React.MouseEvent<HTMLElement>) => void }) => {
    return (
      <MenuItem
        key={model.name}
        text={model.name}
        onClick={handleClick}
      />
    );
  };

  const handleItemSelect = (item: ModelInfo) => {
    setSelectedModel(item);
    onModelSelect(item);
  };

  if (modelList.isLoading) {
    return <div>Loading...</div>;
  }

  if (modelList.error) {
    return <div>Error: {modelList.error}</div>;
  }

  if (!modelList.models || modelList.models.length === 0) {
    return <div>No models available</div>;
  }

  const models = modelList.models as ModelInfo[];

  return (
    <ModelSelect
      items={models}
      itemRenderer={renderModel}
      onItemSelect={handleItemSelect}
      disabled={disabled}
    >
      <Button
        text={selectedModel?.name || models[0].name}
        rightIcon="double-caret-vertical"
        disabled={disabled || modelList.isLoading}
      />
    </ModelSelect>
  );
};

export { ModelSelectComponent as ModelSelect };