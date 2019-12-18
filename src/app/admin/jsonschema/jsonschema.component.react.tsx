import * as React from "react";
import { render } from "react-dom";
import Form from "react-jsonschema-form-bs4";


export function createSchema(element, schema, uiSchema, initialData, callback, callbackDelete) {
  render((
    <Form schema={schema}
          uiSchema={uiSchema}
          formData={initialData}
          onSubmit={callback}>
      <p>
        <button type="submit" className="btn btn-info mr-2">Save</button>
        { callbackDelete ? <button onClick={callbackDelete} type="button" className="btn btn-danger mr-2">Delete</button> : null }
      </p>
    </Form>
  ), element);
}
