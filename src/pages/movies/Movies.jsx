import { Container, Select, Grid, Skeleton, Heading } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { fetchMovies } from "../../services/api";
import CardComponent from "../../components/CardComponent";
import PaginationComponent from "../../components/PaginationComponent";

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("popularity.desc");
  useEffect(() => {
    setIsLoading(true);
    fetchMovies(activePage, sortBy)
      .then((res) => {
        setMovies(res?.results);
        setActivePage(res?.page);
        setTotalPages(res?.total_pages);
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  }, [activePage, sortBy]);
  return (
    <Container maxW={"container.xl"}>
      <Heading as="h2" fontSize="md" textTransform={"uppercase"}>
        Discover Movies
      </Heading>
      <Select
        w={"130px"}
        onChange={(e) => {
          setActivePage(1);
          setSortBy(e.target.value);
        }}
      >
        <option value="popularity.desc">Popular</option>
        <option value="vote_average.desc&vote_count.gte=1000">Top Rated</option>
      </Select>
      <Grid
        templateColumns={{
          base: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
          lg: "repeat(5, 1fr)",
        }}
        gap={"4"}
      >
        {movies &&
          movies?.map((item, i) =>
            isLoading ? (
              <Skeleton height={300} key={i} />
            ) : (
              <CardComponent key={item?.id} item={item} type={"movie"} />
            )
          )}
      </Grid>
      <PaginationComponent
        activePage={activePage}
        totalPages={totalPages}
        setActivePage={setActivePage}
      />
    </Container>
  );
}
