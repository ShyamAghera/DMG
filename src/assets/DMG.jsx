import { useState } from "react";


function DMG() {
    const [modelName, setModelName] = useState("");
    const [tableName, setTableName] = useState("");
    const [useTimestamps, setUseTimestamps] = useState(true);
    const [isES6, setIsES6] = useState(true); // Switch between ES6 and CommonJS
    const [fields, setFields] = useState([
      { name: "", type: "", required: false, unique: false, defaultValue: "" },
    ]);
  
    // Handle form field changes for model fields
    const handleFieldChange = (index, field, value) => {
      const newFields = [...fields];
      newFields[index][field] = value;
      setFields(newFields);
    };
  
    // Add new field input
    const addField = () => {
      setFields([
        ...fields,
        { name: "", type: "", required: false, unique: false, defaultValue: "" },
      ]);
    };
  
    // Remove a field input
    const removeField = (index) => {
      const newFields = [...fields];
      newFields.splice(index, 1);
      setFields(newFields);
    };
  
    // Generate Sequelize Model Code
    const generateSequelizeCode = () => {
      const syntax = isES6
        ? `import { Sequelize, DataTypes } from 'sequelize';`
        : `const { Sequelize, DataTypes } = require('sequelize');`;
  
      let modelCode = `${syntax}
    const sequelize = new Sequelize('mysql://user:pass@localhost:3306/mydb');
    
    const ${modelName} = sequelize.define('${modelName}', {`;
  
      fields.forEach((field) => {
        modelCode += `
      ${field.name}: {
        type: DataTypes.${field.type.toUpperCase()},
        allowNull: ${field.required ? false : true},
        unique: ${field.unique},
        defaultValue: ${field.defaultValue ? `'${field.defaultValue}'` : "null"},
      },`;
      });
  
      modelCode += `
    }, {
      tableName: '${tableName}', 
      timestamps: ${useTimestamps}
    });
    
    ${isES6 ? `export default ${modelName};` : `module.exports = ${modelName};`}`;
  
      return modelCode;
    };
  
    // Generate Mongoose Model Code
    const generateMongooseCode = () => {
      const syntax = isES6
        ? `import mongoose from 'mongoose';`
        : `const mongoose = require('mongoose');`;
  
      let modelCode = `${syntax}
    const { Schema } = mongoose;
    
    const ${modelName}Schema = new Schema({`;
  
      fields.forEach((field) => {
        modelCode += `
      ${field.name}: {
        type: ${mapMongooseDataType(field.type)},
        required: ${field.required},
        unique: ${field.unique},
        default: ${field.defaultValue ? `'${field.defaultValue}'` : "null"},
      },`;
      });
  
      modelCode += `
    }, {
      collection: '${tableName}', 
      timestamps: ${useTimestamps}
    });
    
    const ${modelName} = mongoose.model('${modelName}', ${modelName}Schema);
    
    ${isES6 ? `export default ${modelName};` : `module.exports = ${modelName};`}`;
  
      return modelCode;
    };
  
    // Generate MySQL CREATE TABLE Query
    const generateMySQLQuery = () => {
      let query = `CREATE TABLE \`${tableName}\` (`;
  
      fields.forEach((field) => {
        query += `\n  \`${field.name}\` ${mapMySQLDataType(field.type)} ${
          field.required ? "NOT NULL" : ""
        } ${field.unique ? "UNIQUE" : ""} ${
          field.defaultValue ? `DEFAULT '${field.defaultValue}'` : ""
        },`;
      });
  
      if (useTimestamps) {
        query += `\n  \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,`;
        query += `\n  \`updatedAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,`;
      }
  
      query = query.slice(0, -1); // Remove trailing comma
      query += `\n);`;
  
      return query;
    };
  
    // Helper function to map MySQL data types
    const mapMySQLDataType = (type) => {
      switch (type) {
        case "string":
          return "VARCHAR(255)";
        case "text":
          return "TEXT";
        case "number":
          return "INT";
        case "bigint":
          return "BIGINT";
        case "float":
          return "FLOAT";
        case "decimal":
          return "DECIMAL(10, 2)";
        case "boolean":
          return "TINYINT(1)";
        case "date":
          return "DATE";
        case "datetime":
          return "DATETIME";
        case "timestamp":
          return "TIMESTAMP";
        case "json":
          return "JSON";
        default:
          return "VARCHAR(255)";
      }
    };
  
    // Helper function to map Mongoose data types
    const mapMongooseDataType = (type) => {
      switch (type) {
        case "string":
          return "String";
        case "number":
          return "Number";
        case "boolean":
          return "Boolean";
        case "date":
          return "Date";
        case "array":
          return "[Schema.Types.Mixed]";
        case "object":
          return "Schema.Types.Mixed";
        case "buffer":
          return "Buffer";
        case "map":
          return "Map";
        case "json":
          return "Schema.Types.Mixed";
        default:
          return "String";
      }
    };
  
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-semibold text-center mb-8">Model Code Generator</h1>
  
        <form>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Model Name</label>
            <input
              type="text"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Enter model name"
            />
          </div>
  
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Table Name</label>
            <input
              type="text"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Enter table/collection name"
            />
          </div>
  
          <div className="mb-6 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                className="form-checkbox h-5 w-5 text-blue-600"
                type="checkbox"
                checked={useTimestamps}
                onChange={() => setUseTimestamps(!useTimestamps)}
              />
              <label className="text-sm">Use Timestamps</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                className="form-checkbox h-5 w-5 text-blue-600"
                type="checkbox"
                checked={isES6}
                onChange={() => setIsES6(!isES6)}
              />
              <label className="text-sm">Use ES6 Syntax</label>
            </div>
          </div>
  
          <h3 className="text-xl font-semibold mb-4">Fields</h3>
          {fields.map((field, index) => (
            <div key={index} className="border p-6 mb-6 rounded-lg bg-gray-50">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Field Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
                  value={field.name}
                  onChange={(e) =>
                    handleFieldChange(index, "name", e.target.value)
                  }
                  placeholder="Field Name"
                />
              </div>
  
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Field Type</label>
                <select
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
                  value={field.type}
                  onChange={(e) =>
                    handleFieldChange(index, "type", e.target.value)
                  }
                >
                  <option value="">Select Type</option>
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="date">Date</option>
                  <option value="array">Array</option>
                  <option value="object">Object</option>
                  <option value="buffer">Buffer</option>
                  <option value="map">Map</option>
                  <option value="json">JSON</option>
                  <option value="text">Text</option>
                  <option value="bigint">BigInt</option>
                  <option value="float">Float</option>
                  <option value="decimal">Decimal</option>
                  <option value="timestamp">Timestamp</option>
                </select>
              </div>
  
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-600"
                    checked={field.required}
                    onChange={(e) =>
                      handleFieldChange(index, "required", e.target.checked)
                    }
                  />
                  <label className="text-sm">Required</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-600"
                    checked={field.unique}
                    onChange={(e) =>
                      handleFieldChange(index, "unique", e.target.checked)
                    }
                  />
                  <label className="text-sm">Unique</label>
                </div>
              </div>
  
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Default Value</label>
                <input
                  type="text"
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
                  value={field.defaultValue}
                  onChange={(e) =>
                    handleFieldChange(index, "defaultValue", e.target.value)
                  }
                  placeholder="Default Value (optional)"
                />
              </div>
  
              <button
                type="button"
                className="mt-4 px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                onClick={() => removeField(index)}
              >
                Remove Field
              </button>
            </div>
          ))}
          <button
            type="button"
            className="mt-4 px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            onClick={addField}
          >
            Add Field
          </button>
        </form>
  
        <h3 className="text-xl font-semibold mt-8">Generated Model Code (Sequelize & Mongoose)</h3>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* Sequelize Code */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h4 className="font-medium mb-4">Sequelize Model</h4>
            <pre className="bg-gray-800 p-4 rounded text-white text-sm overflow-x-auto">{generateSequelizeCode()}</pre>
          </div>
  
          {/* Mongoose Code */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h4 className="font-medium mb-4">Mongoose Model</h4>
            <pre className="bg-gray-800 p-4 rounded text-white text-sm overflow-x-auto">{generateMongooseCode()}</pre>
          </div>
  
          {/* MySQL Query */}
          <div className="col-span-1 md:col-span-2 bg-gray-100 p-6 rounded-lg shadow-md">
            <h4 className="font-medium mb-4">MySQL CREATE TABLE Query</h4>
            <pre className="bg-gray-800 p-4 rounded text-white text-sm overflow-x-auto">{generateMySQLQuery()}</pre>
          </div>
        </div>
      </div>
    );
  };

export default DMG