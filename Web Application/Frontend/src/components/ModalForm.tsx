import { Box, Button, FormControl, FormErrorMessage, FormLabel, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper } from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { FormField } from "../interface/util";

interface Props {
  isOpen: boolean
  onClose: () => void;
  handleSubmit: () => Promise<void>;
  title: string;
  fields: Array<FormField>;
  dynamicFields?: Array<any>;
  handleDynamicFields?: (idx: number, key: string, value: string) => void;
  handleDynamicAddField?: () => void;
  handleDynamicDeleteField?: (idx: number) => void;
}

const ModalForm = ({ 
  isOpen, 
  onClose, 
  handleSubmit, 
  title, 
  fields, 
  dynamicFields, 
  handleDynamicFields,
  handleDynamicAddField,
  handleDynamicDeleteField
} : Props) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={e => {
        e.preventDefault();
        handleSubmit();
      }}>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {fields.map((val, idx) => (
            <FormControl isInvalid={val.isInvalid} key={idx}>
              <FormLabel>{val.label}</FormLabel>
              {val.type === "number" ? (
                <NumberInput value={val.value} onChange={value => val.setValue(Number(value))} min={1}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              ) : (
                <Input type={val.type ? val.type : "text"} value={val.value} onChange={e => val.setValue(e.target.value)} placeholder={val.placeholder} />
              )}
              {val.isInvalid ? (
                <FormErrorMessage>{val.invalidMessage}</FormErrorMessage>
              ) : (
                <></>
              )}
            </FormControl>
          ))}
          {dynamicFields?.map((val, idx) => (
            <Box key={idx} mt="2" display="flex" alignItems="center" justifyContent="space-between">
              <Box w="85%">
                {Object.keys(val).filter((label) => label !== "id").map((label, idx2) => (
                  <FormControl key={idx2}>
                    <FormLabel>{label}</FormLabel>
                    <Input value={val[label]} onChange={e => handleDynamicFields!(idx, label, e.target.value)} placeholder={label} />
                  </FormControl>
                ))}
              </Box>
              <IconButton aria-label="Add" icon={<DeleteIcon />} onClick={() => handleDynamicDeleteField!(idx)} />
            </Box>
          ))}
          {handleDynamicAddField? (
            <IconButton aria-label="Add" icon={<AddIcon />} onClick={() => handleDynamicAddField()} />
          ) : (
            <></>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Batal
          </Button>
          <Button colorScheme="blue" type="submit">Kirim</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalForm;