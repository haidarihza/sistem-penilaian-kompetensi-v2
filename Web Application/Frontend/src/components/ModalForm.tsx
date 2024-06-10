import React, { useState } from "react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { FormField } from "../interface/util";
import { Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper } from "@chakra-ui/react";

interface Props {
  isOpen: boolean
  onClose: () => void;
  handleSubmit: () => Promise<void>;
  title: string;
  fields: Array<FormField>;
  dynamicFields?: Array<any>;
  buttonContent?: string;
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
  buttonContent="Kirim",
  handleDynamicFields,
  handleDynamicAddField,
  handleDynamicDeleteField
} : Props) => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={e => {
        setIsSubmit(true);
        e.preventDefault();
        handleSubmit();
      }}>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {fields.map((val, idx) => (
            <FormControl isInvalid={val.isInvalid && isSubmit} key={idx}>
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
          <Button bg="white" color="main_blue" _hover={{ bg: "second_blue", color: "white" }} mr="2" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" bg="main_blue" color="white" _hover={{ bg: "second_blue" }}>
            {buttonContent}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalForm;