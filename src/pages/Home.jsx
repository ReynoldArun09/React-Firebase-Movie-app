import {
  Container,
  Skeleton,
  Box,
  Flex,
  Grid,
  Heading,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { fetchTrending } from "../services/api";

import CardComponent from "../components/CardComponent";

export default function Home() {
  const [data, setData] = useState([]);
  const [timeWindow, setTimeWindow] = useState("day");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTrending(timeWindow)
      .then((res) => setData(res))
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setLoading(false));
  }, [timeWindow]);

  return (
    <Container maxW={"container.xl"}>
      <Flex alignItems={"baseline"} gap={"4"} my={"10"}>
        <Heading as="h2" fontSize="md" textTransform={"uppercase"}>
          Treding
        </Heading>
        <Flex
          alignItems={"center"}
          gap={"2"}
          border={"1px solid teal"}
          borderRadius={"20px"}
        >
          <Box
            as="button"
            px={"3"}
            py={"1"}
            borderRadius={"20px"}
            onClick={() => setTimeWindow("day")}
            bg={`${timeWindow === "day" ? "gray.800" : ""}`}
          >
            Today
          </Box>
          <Box
            as="button"
            px={"3"}
            py={"1"}
            borderRadius={"20px"}
            onClick={() => setTimeWindow("week")}
            bg={`${timeWindow === "week" ? "gray.800" : ""}`}
          >
            This Week
          </Box>
        </Flex>
      </Flex>
      <Grid
        templateColumns={{
          base: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={"5"}
      >
        {data &&
          data?.map((item, i) =>
            loading ? (
              <Skeleton height={300} key={i} />
            ) : (
              <CardComponent
                key={item?.id}
                item={item}
                type={item?.media_type}
              />
            )
          )}
      </Grid>
    </Container>
  );
}
