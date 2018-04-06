import React from "react";
import { Editor } from "draft-js";
import {
  deSerialize,
  serialize,
  serPreview,
  getSearchableText,
  addColumn,
  removeColumn
} from "./util";
import "./style.css";

const MUTATION_NAME = "ManyColumnEditor";

function manyColumnContentView(ContentView, api) {
  return class extends React.Component {
    componentDidUpdate(prevProps) {
      const contentLoaded =
        prevProps.isLoadingContent === true &&
        this.props.isLoadingContent === false &&
        this.props.note.mutationName === MUTATION_NAME;
      if (contentLoaded) {
        this.finishedLoadingContent();
      }
      const simulatedKeyCommand =
        prevProps.simulatedKeyCommand === null &&
        this.props.simulatedKeyCommand !== null;
      if (simulatedKeyCommand) {
        this.handleSimulatedKeyCommand(
          this.props.simulatedKeyCommand,
          this.props.ourEditorState
        );
      }
    }

    finishedLoadingContent = () => {
      this.props.note.getContent().then(content => {
        const editorState = deSerialize(content[this.props.note.mutationName]);
        this.props.onContentLoaded(editorState);
      });
    };

    handleSimulatedKeyCommand(command, editorState) {
      if (command === "add-column") {
        addColumn(editorState);
        this.onChange(editorState, true);
      } else if (command === "remove-column") {
        if (removeColumn(editorState)) {
          this.onChange(editorState, true);
        }
      }
    }

    onChange = (editorState, save) => {
      const serializedContent = serialize(editorState);
      const serializedPreview = serPreview(editorState);
      const searchableText = getSearchableText(editorState);

      this.props.onChange(
        editorState,
        serializedContent,
        serializedPreview,
        searchableText,
        save
      );
    };

    onSingleChange = (state, index) => {
      const editorState = this.props.ourEditorState;
      editorState.editors[index] = state;
      this.onChange(editorState);
    };

    render() {
      if (this.props.note && this.props.note.mutationName === MUTATION_NAME) {
        const { onChange, isLoadingContent, ...props } = this.props;
        const editors = this.props.ourEditorState.editors.map((col, index) => {
          let className = "editor";
          if (index > 0) {
            className = "editor not-first-editor";
          }
          return (
            <div className={className} key={"editor-div" + index}>
              <Editor
                key={"editor" + index}
                editorState={col}
                onChange={editorState => {
                  this.onSingleChange(editorState, index);
                }}
                placeholder={"Change me!"}
                {...props}
              />
            </div>
          );
        });
        return <div className="editor-container">{editors}</div>;
      }
      return <ContentView {...this.props} />;
    }
  };
}

module.exports.mutations = {
  ContentView: manyColumnContentView
};

window.toolbar.buttons.push({
  icon: "➕",
  command: "add-column",
  hint: "Add a new column to note",
  noteType: MUTATION_NAME
});
window.toolbar.buttons.push({
  icon: "➖",
  command: "remove-column",
  hint: "Remove right-most column in note",
  noteType: MUTATION_NAME
});
