import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { Tbody, Tr, Td, IconButton, Text, Box } from '@chakra-ui/react';
import { DeleteIcon, DragHandleIcon } from '@chakra-ui/icons';
import { Competency } from '../../interface/competency';
import { Question } from '../../interface/question';

const DragHandle = SortableHandle(() => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <IconButton size="xs" aria-label="Drag" color="main_blue" icon={<DragHandleIcon />} />
  </div>
));

// Sortable Item
interface SortableItemProps {
  val: Question;
  idx: number;
  competencyCollections: Array<Competency>;
  handleDeleteQuestion: (idx: number) => void;
}

const SortableItem = SortableElement<SortableItemProps>(({ val, idx, competencyCollections, handleDeleteQuestion }: SortableItemProps) => (
  <Tr key={val.id}>
    <Td>
      <DragHandle />
    </Td>
    <Td w="50%" whiteSpace="normal" overflow="hidden" textOverflow="ellipsis">{val.question}</Td>
    <Td textAlign="center">{val.duration_limit} menit</Td>
    <Td textAlign="center">
      <Box display="flex" flexDir="row" p="0" flexWrap="wrap" justifyContent="center">
        {val.labels.map((val, idx) => (
        <Box key={idx} display="flex" alignItems="center" w="fit-content" rounded="md" bg="main_blue" mr="2" mb="2">
          <Text fontSize="sm" fontWeight="normal" color="white" pl="1" pr="1">
            {competencyCollections.find((label) => label.id === val.competency_id)?.competency}
          </Text>
        </Box>
        ))}
      </Box>
    </Td>
    <Td>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <IconButton display="block" size="xs" aria-label="Delete" bg="main_blue" color="white" icon={<DeleteIcon />} onClick={() => handleDeleteQuestion(idx)} />
      </div>
    </Td>
  </Tr>
));

// Sortable Container
interface SortableListProps {
  items: Array<Question>;
  competencyCollections: Array<Competency>;
  handleDeleteQuestion: (idx: number) => void;
}

const SortableList = SortableContainer<SortableListProps>(({ items, competencyCollections, handleDeleteQuestion }: SortableListProps) => {
  return (
    <Tbody>
      {items.map((val, idx) => (
        <SortableItem key={val.id} index={idx} val={val} idx={idx} competencyCollections={competencyCollections} handleDeleteQuestion={handleDeleteQuestion} />
      ))}
    </Tbody>
  );
});

interface SortableTableCompetencyProps {
  items: Array<Question>;
  onSortEnd: ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => void;
  handleDeleteQuestion: (idx: number) => void;
  competencyCollections: Array<Competency>;
}

const SortableTableCompetency = ({ items, onSortEnd, handleDeleteQuestion, competencyCollections }: SortableTableCompetencyProps) => {
  return (
    <SortableList items={items} onSortEnd={onSortEnd} competencyCollections={competencyCollections} handleDeleteQuestion={handleDeleteQuestion} useDragHandle />
  );
};

export default SortableTableCompetency;