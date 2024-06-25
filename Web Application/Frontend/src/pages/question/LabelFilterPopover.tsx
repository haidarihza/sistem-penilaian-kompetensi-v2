import React from 'react';
import { QuestionLabelOptions } from '../../interface/question';
import {
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  List,
  ListItem,
  Checkbox,
  CheckboxGroup
} from '@chakra-ui/react';
import { FaFilter } from "react-icons/fa";

interface Props {
  labelOptions: Array<QuestionLabelOptions>;
  filteredLabels: Array<QuestionLabelOptions>;
  handleApplyFilter: (filteredLabels: Array<QuestionLabelOptions>) => void;
}

const LabelFilterPopover = ({
  labelOptions,
  filteredLabels,
  handleApplyFilter
}: Props) => {
  const handleChange = (values: Array<string>) => {
    const newLabels = labelOptions.filter(label => values.includes(label.id));
    handleApplyFilter(newLabels);
  };

  return (
    <Popover
      placement='bottom-start'
    >
      <PopoverTrigger>
        <IconButton
          aria-label="Filter"
          icon={<FaFilter />}
          colorScheme='white.400'
          color="main_blue"
          size="lg"
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>Pilih Label</PopoverHeader>
        <PopoverBody>
          <CheckboxGroup value={filteredLabels.map(label => label.id)} onChange={handleChange}>
            <List>
              {labelOptions.map(label => (
                <ListItem key={label.id}>
                  <Checkbox value={label.id}>{label.competency}</Checkbox>
                </ListItem>
              ))}
            </List>
          </CheckboxGroup>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default LabelFilterPopover;