import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { Tbody, Tr, Td, IconButton, Text } from '@chakra-ui/react';
import { DeleteIcon, DragHandleIcon } from '@chakra-ui/icons';
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
}

const SortableItem = SortableElement<SortableItemProps>(({ val, idx, handleDeleteCompetency }: SortableItemProps) => (
  <Tr key={val.id}>
    <Td>
      <DragHandle />
    </Td>
    <Td w="20%">{val.competency}</Td>
    <Td w="60%" whiteSpace="normal" overflow="hidden" textOverflow="ellipsis">
      {val.description}
    </Td>
    <Td w="10%">
      {val.levels.map((level) => (
        <Text maxW="10rem" noOfLines={1} key={level.id}>{level.level}</Text>
      ))}
    </Td>
    <Td w="10%">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <IconButton size="xs" aria-label="Delete" bg="main_blue" color="white" icon={<DeleteIcon />} onClick={() => handleDeleteCompetency(idx)} />
      </div>
    </Td>
  </Tr>
));

// Sortable Container
interface SortableListProps {
  items: Array<Competency>;
  handleDeleteCompetency: (idx: number) => void;
}

const SortableList = SortableContainer<SortableListProps>(({ items, handleDeleteCompetency }: SortableListProps) => {
  return (
    <Tbody>
      {items.map((val, idx) => (
        <SortableItem key={val.id} index={idx} val={val} idx={idx} handleDeleteCompetency={handleDeleteCompetency} />
      ))}
    </Tbody>
  );
});

interface SortableTableCompetencyProps {
  items: Array<Competency>;
  onSortEnd: ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => void;
  handleDeleteCompetency: (idx: number) => void;
}

const SortableTableCompetency = ({ items, onSortEnd, handleDeleteCompetency }: SortableTableCompetencyProps) => {
  return (
    <SortableList items={items} onSortEnd={onSortEnd} handleDeleteCompetency={handleDeleteCompetency} useDragHandle />
  );
};

export default SortableTableCompetency;