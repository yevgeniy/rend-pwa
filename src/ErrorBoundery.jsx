import React from "react";
import { Button, Divider, makeStyles } from "@material-ui/core";
import { useStore } from "./hooks";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.c = 0;
  }

  componentDidMount() {
    window.addEventListener("click", this.trackclick);
  }
  componentWillUnmount() {
    window.removeEventListener("click", this.trackclick);
  }

  trackclick = () => {
    clearTimeout(this.t);
    this.t = setTimeout(() => {
      console.log("cleared");
      this.c = 0;
    }, 800);

    this.c++;
    if (this.c === 10) {
      this.setState({ hasError: true });
      this.c = 0;
    }
  };

  componentDidCatch(error, info) {
    this.setState({ hasError: true, error, info });
  }
  didClearCache = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ClearCache
          didClearCache={this.didClearCache}
          error={this.state.error}
          info={this.state.info}
        />
      );
    }
    return this.props.children;
  }
}

const ClearCache = ({ didClearCache, error, info }) => {
  const [, , clear] = useStore(v => v);
  const doClearCashe = () => {
    clear();
    didClearCache();
  };
  return (
    <div>
      <div style={{ padding: "5px 0" }}>
        <Button variant="contained" color="primary" onClick={doClearCashe}>
          Clear Cache
        </Button>
        <Button variant="contained" color="default" onClick={didClearCache}>
          Cancel
        </Button>
      </div>
      <Divider />
      <div style={{ padding: "5px 0" }}>Error: {error && error.toString()}</div>
      <Divider />
      <div style={{ padding: "5px 0" }}>Error: {error && error.stack}</div>
      <Divider />
      <div style={{ padding: "5px 0" }}>Info: {info && info.toString()}</div>
    </div>
  );
};

export default ErrorBoundary;
