import React from "react";
import { Editor } from "draft-js";

//ContentView is Aurora component being mutated in this example
function twoColumnContentView(ContentView, api) {
  return class extends React.Component {
    render() {
      {
        return (
          //Mutation code here
          <div />
        );
      }
      //return the Aurora component being mutated, i.e. ContentView
      return <ContentView {...this.props} />;
    }
  };
}

module.exports.mutations = {
  //Aurora component being mutated: name of function
  ContentView: twoColumnContentView
};
