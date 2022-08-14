const fs = require("fs");
const fcolor = require("font-color-contrast");

const colors = require("../dist/colors");
const { Color } = require("../dist/color");

/**
 * https://gist.github.com/penguinboy/762197
 */
function flattenObject(object) {
  const toReturn = {};
  Object.keys(object).forEach((key) => {
    const element = object[key];
    if (element instanceof Color) {
      toReturn[key] = element;
    } else {
      const flattened = flattenObject(element);
      Object.keys(flattened).forEach((nestKey) => {
        toReturn[`${key}.${nestKey}`] = flattened[nestKey];
      });
    }
  });

  return toReturn;
}

const dark = flattenObject(colors.dark);
const light = flattenObject(colors.light);
const mirage = flattenObject(colors.mirage);

const bgs = ["light", "mirage", "dark"].map((v) => colors[v].ui.bg.hex());

console.dir(bgs);

// Starts it off with the header
let tableRows = ["Path", "Light", "Mirage", "Dark"]
  .map((e, i) => {
    const bg = bgs[i - 1] || "#FFFFFF";
    const color = fcolor(bg);
    return `<th style="background: ${bg}; color: ${color}">${e}</th>`;
  })
  .join("");

Object.keys(light).forEach((key) => {
  if (light.hasOwnProperty(key) && light[key] instanceof Color) {
    let rowContents = `<td style="color: #333333">${key}</td>`;

    [light[key], mirage[key], dark[key]]
      .map((e, i) => [e, bgs[i]])
      .forEach(([variant, bg]) => {
        const color = fcolor(variant.hex());
        const hex = variant.hex().toUpperCase();
        rowContents += 
          `<td style="background: ${bg}">` +
            `<div style="color: ${color}; background: ${hex}"> ${hex}</div>` +
          "</td>";
      });

    tableRows += `<tr>${rowContents}</tr>`;
  }
});

const html = `
<!DOCTYPE html>
<html>
  <meta charset="UTF-8">
  <head>
    <title>Ayu Colors</title>
    <style>
      body { margin: 0px; }
      * { font: 10px "monospace"; }

      table {
        border-spacing: 0;
        width: 100%;
      }

      td { padding: 0 20px 10px 20px; }
      th { padding: 20px; }

      div {
        border-radius: 2px;
        padding: 3px 40px 3px 5px;
      }
    </style>
  </head>
  <body><table>${tableRows}</table></body>
</html>`;

fs.writeFileSync("colors.html".trim(), html, "utf-8");
