import React, { useState, useEffect, useRef } from "react";
import { Chip, TextField, makeStyles } from "@material-ui/core";

import Autocomplete from "@material-ui/lab/Autocomplete";

const useAutocompleteStyles = makeStyles(
  theme => ({
    root: { padding: 0, width: "100%", color: "white" },
    endAdornment: { display: "none" },
    input: {
      minWidth: "100px !important"
    }
  }),
  { name: "autocomplete-overrides" }
);
const useAutocompleteChipStyles = makeStyles(
  theme => ({
    deleteIcon: {}
  }),
  { name: "autocomplete-chip-overrides" }
);

const AutoComplete = ({ keywords, allKeywords, onUpdate }) => {
  const ref = useRef({});
  const autoCompleteClasses = useAutocompleteStyles({});
  const autoCompleteChipClasses = useAutocompleteChipStyles({});

  const update = e => {
    setTimeout(() => {
      let kw = [...ref.current.querySelectorAll(".MuiChip-label")].map(
        v => v.innerHTML
      );
      kw = Array.from(new Set(kw || []));
      kw = kw.filter(v => v).map(v => v.toLowerCase());

      console.log(kw, allKeywords);
      onUpdate(kw || []);
      // updateImage({ keywords: kw || [] });
      // set_allKeyWords(Array.from(new Set([...allKeywords, ...kw])));
    });
  };

  return (
    <Autocomplete
      ref={ref}
      classes={autoCompleteClasses}
      multiple
      id="tags-filled"
      options={(allKeywords || [])
        .filter(v => v)
        .filter(v => !(keywords || []).some(z => z === v))}
      defaultValue={keywords || []}
      onChange={update}
      freeSolo
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            classes={autoCompleteChipClasses}
            variant="outlined"
            label={option}
            {...getTagProps({ index })}
          />
        ))
      }
      renderInput={params => {
        return (
          <TextField
            className={autoCompleteClasses.input}
            {...params}
            placeholder="-- ADD KEYWORD --"
            fullWidth
          />
        );
      }}
    />
  );
};

export default AutoComplete;
