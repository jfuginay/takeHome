
import { useSession } from "next-auth/react";
import { Button, Center, Flex, Spinner, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { type UserRole } from "@prisma/client";
import { useRouter } from "next/router";

export function AuthRequired({
  children,
  roles,
}: {
  children: ReactNode;
  roles: UserRole[];
  allowNoGroup?: boolean;
}) {
  const { status, data } = useSession();

  const router = useRouter();

  if (status === "loading") {
    return (
      <Center h={"90vh"}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="teal.400"
          color=""
          size="xl"
        />
      </Center>
    );
  }

  if (
    status === "unauthenticated" ||
    !data ||
    !roles.includes(data.user.role)
  ) {
    return (
      <Center h={"85vh"}>
        <Flex
          direction={"column"}
          justifyContent={"center"}
          alignItems={"center"}
          gap={3}
          textAlign={"center"}
          margin={"0 20px"}
        >
          <Text
            as={"b"}
            fontSize={{ md: "7xl", base: "5xl" }}
            color={"red.400"}
          >
            Access denied
          </Text>
          <Text fontSize={"xl"}>
            You need to sign in before you can access this page
          </Text>

          <Button onClick={() => void router.push("/")}>Back to home</Button>
        </Flex>
      </Center>
    );
  }

  return <main>{children}</main>;
}

export default AuthRequired;
