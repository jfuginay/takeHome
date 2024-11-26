import { Spinner } from "@chakra-ui/react"

const Loading = () => {
 return (
   <Spinner
     thickness="4px"
     speed="0.65s"
     emptyColor="darkblue.400"
     color=""
     size="xl"
   />
 )
}

export default Loading
