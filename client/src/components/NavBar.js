import {Box,Button,makeStyles} from "@material-ui/core";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
    root: {
      flex: 1,
      padding: "1%"
    },
  }));
  
const routes = [
  {route: "/", title: "Home"},
  {route: "/matching", title: "Confirmed Matchings"},
  {route: "/volunteers", title: "View Volunteers"},
  {route: "/trips", title: "Book Trips"},
  {route: "/upload", title: "Upload Files"}
];


export const NavBar = () => {
    const history = useHistory();
    const classes = useStyles();
    return(
    <Box className={classes.root}>
      {routes.map(({ route, title }, index) => (<Button size='large' key={index} onClick={() => history.push(route)}>{title}</Button>))}
    </Box> 
    )
}