import { UseToastOptions } from '@chakra-ui/react'

const ToastModal = (toast: (options?: UseToastOptions) => void, title: string, description: string, status: "success" | "error" | "warning" | "info") => {
  toast({
    title: title,
    description: description,
    status: status,
    duration: 9000,
    isClosable: true,
  })
}

export default ToastModal;