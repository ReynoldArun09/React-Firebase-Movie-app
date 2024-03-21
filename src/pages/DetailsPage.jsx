import { useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Image,
  Heading,
  Container,
  Spinner,
  Text,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Badge,
  useToast,
} from "@chakra-ui/react";
import {
  CalendarIcon,
  CheckCircleIcon,
  SmallAddIcon,
  TimeIcon,
} from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import {
  fetchDetails,
  imagePath,
  imageOriginalPath,
  fetchCredits,
  fetchVideos,
} from "../services/api";
import {
  minutesTohours,
  resolveRatingColor,
  ratingToPercentage,
} from "../utils/helper";
import VideoComponent from "../components/VideoComponent";
import { useAuth } from "../hooks/useAuth";
import { useFirestore } from "../services/firestore";

export default function DetailsPage() {
  const { type, id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState({});
  const [cast, setCast] = useState({});
  const [videos, setVideos] = useState({});
  const [video, setVideo] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const { addToWatchList, checkIfInWatchList, removeFromWatchlist } = useFirestore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [detailsData, creditsData, videosData] = await Promise.all([
          fetchDetails(type, id),
          fetchCredits(type, id),
          fetchVideos(type, id),
        ]);

        // Set details
        setDetails(detailsData);

        // Set cast
        setCast(creditsData?.cast?.slice(0, 10));

        // Set video/s
        const video = videosData?.results?.find(
          (video) => video?.type === "Trailer"
        );
        setVideo(video);
        const videos = videosData?.results
          ?.filter((video) => video?.type !== "Trailer")
          ?.slice(0, 10);
        setVideos(videos);
      } catch (error) {
        console.log(error, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id]);


  useEffect(() => {
    if(!user) {
      setIsInWatchlist(false)
      return
    }

    checkIfInWatchList(user.uid,id).then((data) => setIsInWatchlist(data))
  }, [user, id, checkIfInWatchList])

  if (loading) {
    return (
      <Flex justify={"center"}>
        <Spinner size={"xl"} color="red" />
      </Flex>
    );
  }
  const handleSaveToWatchlist = async () => {
    if (!user) {
      toast({
        title: "Login to add to watchlist",
        status: "error",
        isClosable: true,
      });
      return;
    }
    const data = {
      id: details?.id,
      title: details?.title || details?.name,
      type: type,
      poster_path: details?.poster_path,
      release_date: details?.release_date || details?.first_air_date,
      vote_average: details?.vote_average,
      overview: details?.overview,
    };
    const dataID = details?.id.toString()
    await addToWatchList(user?.uid, dataID, data)
    const isSetToWatchList = await checkIfInWatchList(user?.uid, dataID)
    setIsInWatchlist(isSetToWatchList)
  };

  const handleRemoveFromWatchlist = async () => {
    await removeFromWatchlist(user?.uid, id);
    const isSetToWatchlist = await checkIfInWatchList(user?.uid, id);
    setIsInWatchlist(isSetToWatchlist);
  };

  const title = details?.title || details?.name;
  const releaseDate =
    type === "tv" ? details?.first_air_date : details?.release_date;
  return (
    <Box>
      <Box
        background={`linear-gradient(rgba(0,0,0,.88), rgba(0,0,0,.88)), url(${imageOriginalPath}/${details?.backdrop_path})`}
        backgroundRepeat={"no-repeat"}
        backgroundSize={"cover"}
        backgroundPosition={"center"}
        w={"100%"}
        h={{ base: "auto", md: "500px" }}
        py={"2"}
        zIndex={"-1"}
        display={"flex"}
        alignItems={"center"}
      >
        <Container maxW={"container.xl"}>
          <Flex
            alignItems={"center"}
            gap={"10"}
            flexDirection={{
              base: "column",
              md: "row",
            }}
          >
            <Image
              height={"450px"}
              borderRadius={"sm"}
              src={`${imagePath}/${details?.poster_path}`}
            />
            <Box>
              <Heading fontSize={"3xl"}>
                {title}{" "}
                <Text as="span" fontWeight={"normal"} color={"gray.400"}></Text>
              </Heading>
              <Flex alignItems={"center"} gap={"4"} mt={1} mb={5}>
                <Flex alignItems={"center"}>
                  <CalendarIcon mr={2} color={"gray.400"} />
                  <Text fontSize={"sm"}>
                    {new Date(releaseDate).toLocaleDateString("en-US")} (US)
                  </Text>
                </Flex>
                {type === "movie" && (
                  <>
                    <Box>*</Box>
                    <Flex alignItems={"center"}>
                      <TimeIcon mr="2" color={"gray.400"} />
                      <Text fontSize={"sm"}>
                        {minutesTohours(details?.runtime)}
                      </Text>
                    </Flex>
                  </>
                )}
              </Flex>
              <Flex alignItems={"center"} gap={"4"}>
                <CircularProgress
                  value={ratingToPercentage(details?.vote_average)}
                  bg={"gray.800"}
                  borderRadius={"full"}
                  p={"0.5"}
                  size={"70px"}
                  color={resolveRatingColor(details?.vote_average)}
                  thickness={"6px"}
                >
                  <CircularProgressLabel fontSize={"lg"}>
                    {ratingToPercentage(details?.vote_average)}{" "}
                    <Box as="span" fontSize={"10px"}>
                      %
                    </Box>
                  </CircularProgressLabel>
                </CircularProgress>
                <Text display={{ base: "none", md: "initial" }}>
                  User Score
                </Text>
                {isInWatchlist ? (
                  <Button
                    leftIcon={<CheckCircleIcon />}
                    colorScheme="green"
                    variant={"outline"}
                    onClick={handleRemoveFromWatchlist}
                  >
                    In watchlist
                  </Button>
                ) : (
                  <Button
                    leftIcon={<SmallAddIcon />}
                    variant={"outline"}
                    onClick={handleSaveToWatchlist}
                  >
                    Add to watchlist
                  </Button>
                )}
              </Flex>
              <Text
                color={"gray.400"}
                fontSize={"sm"}
                fontStyle={"italic"}
                my="5"
              >
                {details?.tagline}
              </Text>
              <Heading fontSize={"xl"} mb={"3"}>
                Overview
              </Heading>
              <Text fontSize={"md"} mb={"3"}>
                {details?.overview}
              </Text>
              <Flex mt="6" gap="2">
                {details?.genres?.map((genre) => (
                  <Badge key={genre?.id} p="1">
                    {genre?.name}
                  </Badge>
                ))}
              </Flex>
            </Box>
          </Flex>
        </Container>
      </Box>
      {/* cast */}
      <Container maxW={"container.xl"} pb="10">
        <Heading as="h2" fontSize={"md"} textTransform={"uppercase"} mt="10">
          Cast
        </Heading>
        <Flex mt="5" mb="10" overflowX={"scroll"} gap={"5"}>
          {cast?.length === 0 && <Text>No cast found</Text>}
          {cast &&
            cast?.map((item) => (
              <Box key={item?.id} minW={"150px"}>
                <Image
                  src={`${imagePath}/${item?.profile_path}`}
                  w={"100%"}
                  height={"225px"}
                  objectFit={"cover"}
                  borderRadius={"sm"}
                />
              </Box>
            ))}
        </Flex>

        <Heading
          as="h2"
          fontSize={"md"}
          textTransform={"uppercase"}
          mt="10"
          mb="5"
        >
          Videos
        </Heading>
        <VideoComponent id={video?.key} />
        <Flex mt="5" mb="10" overflowX={"scroll"} gap={"5"}>
          {videos &&
            videos?.map((item) => (
              <Box key={item?.id} minW={"290px"}>
                <VideoComponent id={item?.key} small />
                <Text fontSize={"sm"} fontWeight={"bold"} mt="2" noOfLines={2}>
                  {item?.name}{" "}
                </Text>
              </Box>
            ))}
        </Flex>
      </Container>
    </Box>
  );
}
