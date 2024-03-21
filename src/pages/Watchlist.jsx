import { useState, useEffect } from "react";
import { Container, Flex, Grid, Heading, Spinner } from "@chakra-ui/react";
import WatchlistCard from "../components/WatchlistCard";
import {useAuth} from '../hooks/useAuth'
import { useFirestore } from "../services/firestore";

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const {user} = useAuth()
  const {getWatchList} = useFirestore()

  useEffect(() => {
    if(user?.uid) {
      getWatchList(user?.uid).then((data) => {
        setWatchlist(data)
      }).catch((error) => {
        console.log(error)
      }).finally(() => {
        setIsLoading(false)
      })
    }
  }, [user?.uid, getWatchList])

  return (
    <Container maxW={"container.xl"}>
      <Flex alignItems={"baseline"} gap={"4"} my={"10"}>
        <Heading as="h2" fontSize={"md"} textTransform={"uppercase"}>
          Watchlist
        </Heading>
      </Flex>
      {isLoading && (
        <Flex justify={"center"} mt="10">
          <Spinner size={"xl"} color="red" />
        </Flex>
      )}
      {!isLoading && watchlist?.length === 0 && (
        <Flex justify={"center"} mt="10">
          <Heading as="h2" fontSize={"md"} textTransform={"uppercase"}>
            Watchlist is empty
          </Heading>
        </Flex>
      )}
      {!isLoading && watchlist?.length > 0 && (
        <Grid
          templateColumns={{
            base: "1fr",
          }}
          gap={"4"}
        >
          {watchlist?.map((item) => (
            <WatchlistCard
              key={item?.id}
              item={item}
              type={item?.type}
              setWatchlist={setWatchlist}
            />
          ))}
        </Grid>
      )}
    </Container>
  );
}
