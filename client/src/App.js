import logo from './logo.svg';
import './App.css';
import { FormControl, Form } from "react-bootstrap"
import Button from '@material-ui/core/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Gallery from 'react-photo-gallery'
import { useState, useEffect } from 'react'

import { fade, makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Search from "@material-ui/icons/Search";
import Box from '@material-ui/core/Box';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import ListSubheader from '@material-ui/core/ListSubheader';

import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import AppBar from '@material-ui/core/AppBar';

import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import { RiLightbulbFlashLine } from 'react-icons/ri'


function App() {

  const [images, setImages] = useState([])
  const [currentFile, setCurrentFile] = useState(null)
  const [search, setSearch] = useState("")

  function handleShowFilename(e) {
    console.log("HI")
    const file = e.target.files[0];
    console.log(file.name)
    setCurrentFile(file);
  }

  function handleSearch(e) {
    setSearch(e.target.value);
  }

  // Fetch images from server
  function fetchImages() {
    fetch('/get_images')
      .then((response) => response.json())
      .then((data) => {
        console.log("Images are", data)
        setImages(data);
      });
  }
  // Perform operations when user loads page
  useEffect(() => {
    fetchImages();

  }, [])


  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    gridList: {
      width: "100%",
      height: "100%",
    },
    icon: {
      color: 'rgba(255, 255, 255, 0.54)',
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
      display: 'none',
      align:"left",
      [theme.breakpoints.up('sm')]: {
        display: 'block',
      },
    },
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.2),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.2),
      },
      marginLeft: 0,
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
      },
    },
    searchIcon: {
      padding: theme.spacing(0, 2),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputRoot: {
      color: 'inherit',
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create('width'),
      color:"#fffffff",
      '&::placeholder': {
        textOverflow: 'ellipsis !important',
        opacity:"100%",
        fontSize:"20px",
        color: "#e6f7da"
      },
      fontWeight:"bold",
      border:"solid",
      borderRadius:"12px",
      opacity:"100%",
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        width: '12ch',
        '&:focus': {
          width: '20ch',
        },
      },
    },


  }));
  const classes = useStyles();



  return (
    <div className="App" className = {classes.root}>


      <AppBar position="static" style={{background:"#3aca5b"}}>
        <Toolbar>
          <RiLightbulbFlashLine size={32} style={{marginRight:"0.2%"}} />
          <Typography className={classes.title} variant="h5" noWrap>
            Tensorflow Gallery: Auto-Tag Your Images!
          </Typography>


          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              onChange={handleSearch}
              placeholder="Search…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </div>
        </Toolbar>
      </AppBar>

      <div style={{ margin: "1%" }}>
        <div className={classes.margin} >



            <form method="post" enctype="multipart/form-data" action="/upload">

              <div style={{display:"flex", flexDirection:"column", width:"100%", justifyContent:"center", alignItems:"center"}}>
              <div style={{display:"flex", flexDirection:"row"}}>


              <label htmlFor="upl" style={{marginRight:"5%"}}>
                <Button variant="contained"
                  style={{background:"#17a2b8", color:"#ffffff", textTransform:"none", fontSize:"150%", width:"100%"}}
                  size="large"
                  disableElevation
                  component="span" >
                  Browse
              </Button>
              </label>

              {currentFile === null ? "" :

                <label htmlFor="submitbutton">
                  <Button variant="contained" color="success" component="span" 
                  style={{display:"block", background:"#3aca5b", color:"#ffffff", fontSize:"150%", textTransform: 'none'           }}
                  size="large"
                  disableElevation={true}
                  >
                    Upload!
                    
              </Button>


                </label>}

                </div>

                {currentFile === null ? "" :
                <Box style={{background:"#1dcede", color:"#ffffff", borderRadius:"5px", borderColor:"#aecc97", borderWidth:"1px", padding:"0.5%",}}>
                  File: {currentFile.name}</Box>
              }
                </div>



              <p>
                <input type="file" name="upl"
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="upl"
                  name="upl"
                  onChange={handleShowFilename}
                  // multiple
                  type="file"
                  accept="image/*"
                />
              </p>
              <input type="submit" id="submitbutton"
                style={{ display: 'none' }}
              />
            </form>
        </div>


        {/* {images !== null? <Gallery photos = {images} /> : "hello"} */}
        <GridList cellHeight={500} className={classes.gridList} cols={4}>
          <GridListTile key="Subheader" cols={4} style={{ height: '100%' }}>
            {/* <ListSubheader component="div">Photos</ListSubheader> */}
          </GridListTile>
          {images.filter(function (img) {
            // Apply search here
            // Check if partial string
            return search === "" || img.prediction.indexOf(search) !== -1
          })
            // Now display the valid images
            .map((image) => (
              <GridListTile key={image.url}>
                <img src={image.url} />
                <GridListTileBar
                  title={image.prediction}
                  subtitle={<span>({Math.round(image.probability * 100)}% confidence)</span>}
                />
              </GridListTile>
            ))}
        </GridList>
      </div>
    </div>
  );
}

export default App;
