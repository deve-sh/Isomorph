import { useContext } from "react";
import { InitialDataContext } from "../InitialDataContextProvider";

const useInitialData = () => {
	return useContext(InitialDataContext);
};

export default useInitialData;
