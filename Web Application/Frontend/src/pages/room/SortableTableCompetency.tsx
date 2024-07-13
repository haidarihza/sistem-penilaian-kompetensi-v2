import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { Tbody, Tr, Td, IconButton, Text } from '@chakra-ui/react';
import { DeleteIcon, DragHandleIcon, ViewIcon } from '@chakra-ui/icons';
import { Competency } from '../../interface/competency';

const DragHandle = SortableHandle(() => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <IconButton size="xs" aria-label="Drag" color="main_blue" icon={<DragHandleIcon />} />
  </div>
));

// Sortable Item
interface SortableItemProps {
  val: Competency;
  idx: number;
  handleDeleteCompetency: (idx: number) => void;
  handleSelectedCompetency: (competency: Competency) => void;
}

const SortableItem = SortableElement<SortableItemProps>(({ val, idx, handleDeleteCompetency, handleSelectedCompetency }: SortableItemProps) => (
  <Tr key={val.id}>
    <Td>
      <DragHandle />
    </Td>
    <Td w="20%">{val.competency}</Td>
    <Td w="50%" whiteSpace="normal" overflow="hidden" textOverflow="ellipsis">
      {val.description}
    </Td>
    <Td w="10%">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <IconButton size="xs" aria-label="Edit" bg="main_blue" color="white" mr="2" icon={<ViewIcon />} onClick={() => handleSelectedCompetency(val)} />
        <IconButton size="xs" aria-label="Delete" bg="main_blue" color="white" icon={<DeleteIcon />} onClick={() => handleDeleteCompetency(idx)} />
      </div>
    </Td>
  </Tr>
));

// Sortable Container
interface SortableListProps {
  items: Array<Competency>;
  handleDeleteCompetency: (idx: number) => void;
  handleSelectedCompetency: (competency: Competency) => void;
}

const SortableList = SortableContainer<SortableListProps>(({ items, handleDeleteCompetency, handleSelectedCompetency }: SortableListProps) => {
  return (
    <Tbody>
      {items.map((val, idx) => (
        <SortableItem key={val.id} index={idx} val={val} idx={idx} handleDeleteCompetency={handleDeleteCompetency} handleSelectedCompetency={handleSelectedCompetency}/>
      ))}
    </Tbody>
  );
});

interface SortableTableCompetencyProps {
  items: Array<Competency>;
  onSortEnd: ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => void;
  handleDeleteCompetency: (idx: number) => void;
  handleSelectedCompetency: (competency: Competency) => void;
}

const SortableTableCompetency = ({ items, onSortEnd, handleDeleteCompetency, handleSelectedCompetency }: SortableTableCompetencyProps) => {
  return (
    <SortableList items={items} onSortEnd={onSortEnd} handleDeleteCompetency={handleDeleteCompetency} handleSelectedCompetency={handleSelectedCompetency} useDragHandle />
  );
};

export default SortableTableCompetency;