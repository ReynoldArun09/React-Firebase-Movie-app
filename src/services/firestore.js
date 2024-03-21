import { db } from "./firebase";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
} from "firebase/firestore";
import { useToast } from "@chakra-ui/react";
import { useCallback } from "react";

export const useFirestore = () => {
  const toast = useToast();
  const addToWatchList = async (userId, dataId, data) => {
    if (await checkIfInWatchList(userId, dataId)) {
      toast({
        title: "Error!",
        description: "This item already added to watchlist",
        status: "error",
        isClosable: true,
        duration: 9000,
      });
      return false;
    }
    try {
      await setDoc(doc(db, "users", userId, "watchlist", dataId), data);
      toast({
        title: "Success!!",
        description: "Added to watch list",
        status: "success",
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error!",
        status: "error",
        isClosable: true,
      });
    }
  };

  const checkIfInWatchList = async (userId, dataId) => {
    const docRef = doc(
      db,
      "users",
      userId?.toString(),
      "watchlist",
      dataId.toString()
    );
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return true;
    } else {
      return false;
    }
  };

  const removeFromWatchlist = async (userId, dataId) => {
    try {
      await deleteDoc(
        doc(db, "users", userId?.toString(), "watchlist", dataId?.toString())
      );
      toast({
        title: "Success!",
        description: "Removed from watchlist",
        status: "success",
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error!",
        description: "An error occurred.",
        status: "error",
        isClosable: true,
      });
      console.log(error, "Error while deleting doc");
    }
  };

  const getWatchList = useCallback(async (userId) => {
    const querySnapshot = await getDocs(collection(db, "users", userId, "watchlist"));
    const data = querySnapshot.docs.map((doc) => ({
      ...doc.data()
    }))
    return data
  }, []);

  return {
    addToWatchList,
    checkIfInWatchList,
    removeFromWatchlist,
    getWatchList
  };
};
