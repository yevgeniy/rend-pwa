import React, { useEffect, useState, useRef } from "react";
import { makeStyles } from "@material-ui/core";
import icon from "./loader.ico";

const SPEED = 500;
const DELAY = 1500;

const useStyles = makeStyles(
  theme => {
    return {
      root: {
        display: "flex",
        height: "90vh",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        transition: `all ${SPEED}ms ease-out`
      },
      img: {
        width: 50,
        transform: "translate(0,-50px)"
      }
    };
  },
  { name: "loader" }
);

const Loading = React.memo(({ test, children }) => {
  const classes = useStyles();
  const [rat, setRat] = useState(null);
  const notloadedFirstTest = useRef(null);

  const loaded = useDelayLoading(test);
  const [opacity, showContent] = useShowContent(loaded);
  useEffect(() => {
    if (rat === 1) var t = setTimeout(() => setRat(0.9), SPEED);
    else if (rat === 0.9) var t = setTimeout(() => setRat(1), SPEED);
    else setRat(0.9);
    return () => clearTimeout(t);
  }, [rat]);

  const containerStyle = {};
  containerStyle.transform = `scale(${rat})`;
  containerStyle.opacity = opacity;

  if ((notloadedFirstTest.current == null && test) || showContent)
    return children;
  notloadedFirstTest.current = false;

  return (
    <div className={classes.root} style={containerStyle}>
      <img className={classes.img} src={icon} alt="" />
    </div>
  );
});

function useShowContent(loaded) {
  const [opacity, setOpacity] = useState(0);
  const [showContent, setShowContent] = useState(false);
  useEffect(() => {
    if (!loaded) {
      setOpacity(1);
      setShowContent(false);
    } else {
      setOpacity(0);
      var t = setTimeout(() => setShowContent(true), 500);
    }
    return clearTimeout(t);
  }, [loaded]);

  return [opacity, showContent];
}

function useDelayLoading(test) {
  const ti = useRef();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!!test) return;

    ti.current = +new Date();
    setLoaded(false);
  }, [test]);

  useEffect(() => {
    if (!ti.current) return;

    const tf = +new Date();

    if (test) {
      if (tf - ti.current > DELAY) setLoaded(true);
      else {
        const res = DELAY - (tf - ti.current);
        var t = setTimeout(() => setLoaded(true), res);
      }
    }
    return () => clearTimeout(t);
  }, [test]);

  return loaded;
}

export default Loading;
