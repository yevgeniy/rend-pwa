import React from "react";
import { Button, Divider } from "@material-ui/core";
import { useStore } from "./hooks";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true, error, info });
  }
  didClearCache = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <ClearCache didClearCache={this.didClearCache} />;
    }
    return this.props.children;
  }
}
const ClearCache = ({ didClearCache, error, info }) => {
  const [_, _2, clear] = useStore(v => v);
  const doClearCashe = () => {
    clear();
    didClearCache();
  };
  return (
    <div>
      <div>
        <Button variant="contained" color="primary" onClick={doClearCashe}>
          Clear Cache
        </Button>
      </div>
      <Divider />
      <div>Error: {error.toString()}</div>
      <Divider />
      <div>Info: {info.toString()}</div>
    </div>
  );
};

export default ErrorBoundary;
