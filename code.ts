// code.ts

interface Table {
	type: string;
	rows: number;
	columns: number;
	columnValues: number[];
	columnContent: string[];
	resizing: string;
	resizingValue: number;
	controls: string;
}

const placeholderKey = "da46e04ae5b772b2dd30fba52d8dc28fcbfca356";
const chipKey = "8618d3bb686bcfbb33425f4b42704f1264fcdf46";
const buttonKey = "a71c22b65bd0196cb0e0607116fec86e868eef2c";
const textKey = "60c7eaa5339ef7b05e3e31654d321ba7b7464384";
const controlsKey = "9374940291a35821c2e09cdec0dab07fad9c050c";

const paddingX = 11;
const paddingY = 11;

figma.showUI(__html__, { width: 400, height: 700 });

figma.ui.onmessage = async (msg: Table) => {
	// Component Definitions
	const placeholder = await figma.importComponentByKeyAsync(placeholderKey);
	const chip = await figma.importComponentSetByKeyAsync(chipKey);
	const button = await figma.importComponentSetByKeyAsync(buttonKey);
	const text = await figma.importComponentSetByKeyAsync(textKey);
	const tableControl = await figma.importComponentSetByKeyAsync(controlsKey);

	//////////////////////
	//                  //
	//  GENERATE TABLE  //
	//                  //
	//////////////////////

	// This function generates tables

	if (msg.type === "generateTable") {
		const {
			rows,
			columns,
			columnValues,
			columnContent,
			resizing,
			resizingValue,
			controls,
		} = msg;

		// Create the Table frame
		// This is the "main" or primary frame

		const tableContainer = figma.createFrame();
		tableContainer.name = "Table";
		tableContainer.layoutMode = "VERTICAL"; // Apply vertical auto layout
		tableContainer.counterAxisSizingMode = "AUTO"; // Adjust size based on content
		tableContainer.primaryAxisAlignItems = "MIN"; // Align children to the top

		// If user has checked "has controls" then we generate controls

		if (controls === "on") {
			const tableControlsInstance =
				tableControl.defaultVariant.createInstance();
			tableControlsInstance.layoutAlign = "STRETCH";
			tableContainer.appendChild(tableControlsInstance);
		}

		// Create the Table Header
		// Note that atm this header is not sized properly

		const headerRow = figma.createFrame();
		headerRow.name = "Header Row";
		headerRow.layoutMode = "HORIZONTAL";
		headerRow.counterAxisSizingMode = "AUTO";
		headerRow.primaryAxisAlignItems = "MIN";
		headerRow.layoutAlign = "STRETCH";

		const bodyCellWidths: number[] = [];

		for (let col = 0; col < columns; col++) {
			const headerCell = figma.createFrame();
			headerCell.name = `[Header] Cell ${col + 1}`;
			headerCell.layoutMode = "HORIZONTAL";
			headerCell.counterAxisAlignItems = "CENTER";
			headerCell.counterAxisSizingMode = "AUTO";
			headerCell.paddingLeft = paddingX;
			headerCell.paddingRight = paddingX;
			headerCell.paddingTop = paddingY;
			headerCell.paddingBottom = paddingY;

			const headerTextInstance = text.defaultVariant.createInstance();
			headerTextInstance.setProperties({ "Text Style": "Label" });
			headerCell.appendChild(headerTextInstance);
			headerRow.appendChild(headerCell);
		}

		tableContainer.appendChild(headerRow);

		// Create frames for rows
		for (let row = 0; row < rows; row++) {
			const rowFrame = figma.createFrame();
			rowFrame.name = `Row ${row + 1}`;
			rowFrame.layoutMode = "HORIZONTAL"; // Apply horizontal auto layout
			rowFrame.counterAxisSizingMode = "AUTO"; // Adjust size based on content
			rowFrame.primaryAxisAlignItems = "MIN"; // Align children to the left

			// Create cells for columns within the row
			for (let col = 0; col < columns; col++) {
				const cellFrame = figma.createFrame();
				cellFrame.layoutMode = "HORIZONTAL"; // Apply horizontal auto layout
				cellFrame.counterAxisAlignItems = "CENTER"; // Align children to the center vertically
				cellFrame.counterAxisSizingMode = "AUTO"; // Align children to the center vertically
				cellFrame.paddingLeft = paddingX;
				cellFrame.paddingRight = paddingX;
				cellFrame.paddingTop = paddingY;
				cellFrame.paddingBottom = paddingY;

				if (columnContent[col] === "Chip") {
					const chipInstance = chip.defaultVariant.createInstance();
					cellFrame.appendChild(chipInstance);
					cellFrame.layoutAlign = "STRETCH"; // Apply horizontal auto layout
					cellFrame.name = `[Chip] Cell`;
				}
				if (columnContent[col] === "Button") {
					const buttonInstance = button.defaultVariant.createInstance();
					buttonInstance.setProperties({ Size: "Medium", Variant: "Tertiary" });
					cellFrame.appendChild(buttonInstance);
					cellFrame.name = `[Button] Cell`;
				}
				if (columnContent[col] === "Placeholder") {
					const instance = placeholder.createInstance();
					cellFrame.appendChild(instance);
					cellFrame.name = `[Placeholder] Cell`;
				}
				if (columnContent[col] === "Text") {
					const textInstance = text.defaultVariant.createInstance();
					textInstance.setProperties({ "Text Style": "Body" });
					cellFrame.appendChild(textInstance);
					cellFrame.layoutAlign = "STRETCH"; // Apply horizontal auto layout
					cellFrame.name = `[Text] Cell`;
				}

				// Check if the column value is greater than 0 (non-default)
				if (columnValues[col] > 0) {
					cellFrame.primaryAxisSizingMode = "FIXED"; // Apply horizontal auto layout
					cellFrame.resize(columnValues[col], cellFrame.height);
				}

				if (columnValues[col] > 998 || columnValues[col] < 0) {
					cellFrame.layoutGrow = 1;
					rowFrame.layoutAlign = "STRETCH";
					rowFrame.primaryAxisSizingMode = "FIXED";
				}

				// Determine HUG widths of each column

				const cellWidth = cellFrame.width;
				bodyCellWidths.push(cellWidth);
				rowFrame.appendChild(cellFrame);
			}

			//  Cleans up the column widths from iteration
			bodyCellWidths.splice(columns);

			// Append the row frame to the table container
			tableContainer.appendChild(rowFrame);

			// Add border bottom for every row
			rowFrame.strokes = [
				{
					type: "SOLID",
					color: { r: 231 / 255, g: 231 / 255, b: 231 / 255 },
					visible: true,
				},
			];
			rowFrame.strokeWeight = 1;
			rowFrame.strokeAlign = "INSIDE"; // Align stroke inside the frame
			rowFrame.strokeBottomWeight = 1;
			rowFrame.strokeTopWeight = 0;
			rowFrame.strokeLeftWeight = 0;
			rowFrame.strokeRightWeight = 0;

			if (resizing == "fill") {
				rowFrame.layoutAlign = "STRETCH";
				rowFrame.primaryAxisSizingMode = "FIXED";
			}
		}

		// Resize header cells to body cell widths

		const headerCells = headerRow.children;
		for (let col = 0; col < columns; col++) {
			const headerCell = headerCells[col] as FrameNode;
			const bodyCellWidth = bodyCellWidths[col];

			if (columnValues[col] > 998 || columnValues[col] < 0) {
				headerCell.layoutGrow = 1;
			} else {
				headerCell.resize(bodyCellWidth, headerCell.height);
			}

			// If any column is set to fill, set header row to fill
			if (columnValues[col] > 998 || columnValues[col] < 0) {
				headerRow.layoutAlign = "STRETCH";
				headerRow.primaryAxisSizingMode = "FIXED";
			}
		}

		if (resizing == "fixed" && resizingValue > 0) {
			tableContainer.counterAxisSizingMode = "FIXED";
			tableContainer.resize(resizingValue, tableContainer.height);
		}

		// Get the viewport center
		const viewport = figma.viewport;
		const centerX = viewport.center.x;
		const centerY = viewport.center.y;

		// Get the table container's dimensions
		const tableWidth = tableContainer.width;
		const tableHeight = tableContainer.height;

		// Calculate the position to center the table
		const positionX = centerX - tableWidth / 2;
		const positionY = centerY - tableHeight / 2;

		// Position the table container
		tableContainer.x = positionX;
		tableContainer.y = positionY;
	}

	//////////////////
	//              //
	//  SAVE TABLE  //
	//              //
	//////////////////

	// This function updates an existing table

	if (msg.type === "saveTable") {
		const selectedTable = figma.currentPage.selection[0] as FrameNode;
		const {
			rows,
			columns,
			columnValues,
			columnContent,
			resizing,
			resizingValue,
			controls,
		} = msg;

		// Controls
		// Check if table has controls, then add or remove

		const hasExistingControls =
			selectedTable.children[0].name === "Table Controls";

		if (controls === "on" && !hasExistingControls) {
			const tableControlsInstance =
				tableControl.defaultVariant.createInstance();
			tableControlsInstance.layoutAlign = "STRETCH";
			selectedTable.insertChild(0, tableControlsInstance);
		} else if (controls === "off" && hasExistingControls) {
			selectedTable.children[0].remove();
		}

		// Updates the count of rows, depending if controls is counted

		const startRowIndex = controls === "on" ? 1 : 0;
		const bodyStartIndex = startRowIndex + 1;

		// Header cells
		// Check for header

		let headerRow: FrameNode;
		if (
			selectedTable.children[startRowIndex] &&
			selectedTable.children[startRowIndex].name === "Header Row"
		) {
			headerRow = selectedTable.children[startRowIndex] as FrameNode;
		} else {
			headerRow = figma.createFrame();
			headerRow.name = "Header Row";
			headerRow.layoutMode = "HORIZONTAL";
			headerRow.counterAxisSizingMode = "AUTO";
			headerRow.primaryAxisAlignItems = "MIN";
			headerRow.layoutAlign = "STRETCH";
			selectedTable.insertChild(startRowIndex, headerRow);
		}

		// Columns
		// Update column count for all rows

		const existingColumnCount = headerRow.children.length;
		for (
			let rowIndex = startRowIndex;
			rowIndex < selectedTable.children.length;
			rowIndex++
		) {
			const row = selectedTable.children[rowIndex] as FrameNode;

			// Add new columns
			for (let colIndex = existingColumnCount; colIndex < columns; colIndex++) {
				const newCell = figma.createFrame();
				newCell.layoutMode = "HORIZONTAL";
				newCell.counterAxisAlignItems = "CENTER";
				newCell.counterAxisSizingMode = "AUTO";
				newCell.paddingLeft = paddingX;
				newCell.paddingRight = paddingX;
				newCell.paddingTop = paddingY;
				newCell.paddingBottom = paddingY;

				if (rowIndex === startRowIndex) {
					// Header cells
					const headerTextInstance = text.defaultVariant.createInstance();
					headerTextInstance.setProperties({ "Text Style": "Label" });
					newCell.appendChild(headerTextInstance);
					newCell.name = `[Header] Cell ${colIndex + 1}`;
				} else {
					// Body cells
					const content = columnContent[colIndex];
					if (content === "Chip") {
						const chipInstance = chip.defaultVariant.createInstance();
						newCell.appendChild(chipInstance);
						newCell.layoutAlign = "STRETCH";
						newCell.name = `[Chip] Cell`;
					} else if (content === "Button") {
						const buttonInstance = button.defaultVariant.createInstance();
						buttonInstance.setProperties({
							Size: "Medium",
							Variant: "Tertiary",
						});
						newCell.appendChild(buttonInstance);
						newCell.name = `[Button] Cell`;
					} else if (content === "Placeholder") {
						const instance = placeholder.createInstance();
						newCell.appendChild(instance);
						newCell.name = `[Placeholder] Cell`;
					} else if (content === "Text") {
						const textInstance = text.defaultVariant.createInstance();
						textInstance.setProperties({ "Text Style": "Body" });
						newCell.appendChild(textInstance);
						newCell.layoutAlign = "STRETCH";
						newCell.name = `[Text] Cell`;
					}
				}

				row.appendChild(newCell);
			}

			// Remove excess columns
			while (row.children.length > columns) {
				row.children[row.children.length - 1].remove();
			}
		}

		// Update cell contents and sizes for all cells

		const updateMaxWidth = (cell: FrameNode, colIndex: number) => {
			if (cell.primaryAxisSizingMode === "AUTO") {
				const contentWidth = cell.children[0]?.width || 0;
				columnMaxWidths[colIndex] = Math.max(
					columnMaxWidths[colIndex],
					contentWidth + paddingX * 2
				);
			} else {
				columnMaxWidths[colIndex] = Math.max(
					columnMaxWidths[colIndex],
					cell.width
				);
			}
		};

		// First pass: Update cell contents and apply layout properties

		for (
			let rowIndex = startRowIndex;
			rowIndex < selectedTable.children.length;
			rowIndex++
		) {
			const row = selectedTable.children[rowIndex] as FrameNode;
			for (let colIndex = 0; colIndex < columns; colIndex++) {
				const cell = row.children[colIndex] as FrameNode;

				if (rowIndex > startRowIndex) {
					const content = columnContent[colIndex];
					const currentCellType = cell.name.match(/\[(.*?)\]/)?.[1] || "";

					// Check if there is a diff in content

					if (content !== currentCellType) {
						while (cell.children.length > 0) {
							cell.children[0].remove();
						}

						if (content === "Chip") {
							const chipInstance = chip.defaultVariant.createInstance();
							cell.appendChild(chipInstance);
							cell.name = `[Chip] Cell`;
						} else if (content === "Button") {
							const buttonInstance = button.defaultVariant.createInstance();
							buttonInstance.setProperties({
								Size: "Medium",
								Variant: "Tertiary",
							});
							cell.appendChild(buttonInstance);
							cell.name = `[Button] Cell`;
						} else if (content === "Placeholder") {
							const instance = placeholder.createInstance();
							cell.appendChild(instance);
							cell.name = `[Placeholder] Cell`;
						} else if (content === "Text") {
							const textInstance = text.defaultVariant.createInstance();
							textInstance.setProperties({ "Text Style": "Body" });
							cell.appendChild(textInstance);
							cell.name = `[Text] Cell`;
						}
					}

					// Apply autolayout formatting

					if (content === "Text") {
						cell.layoutAlign = "STRETCH";
						cell.layoutGrow = 1;
						cell.primaryAxisSizingMode = "FIXED";
						if (cell.children[0] && cell.children[0].type === "TEXT") {
							(cell.children[0] as TextNode).layoutAlign = "STRETCH";
						}
					} else {
						cell.layoutAlign = "CENTER";
						cell.layoutGrow = 0;
						cell.primaryAxisSizingMode = "AUTO";
					}

					// Update cell size

					if (columnValues[colIndex] > 0 && columnValues[colIndex] < 999) {
						cell.primaryAxisSizingMode = "FIXED";
						cell.layoutGrow = 0;
						cell.resize(columnValues[colIndex], cell.height);
					} else if (columnValues[colIndex] >= 999) {
						cell.primaryAxisSizingMode = "AUTO";
						cell.layoutGrow = 1;
					} else {
						cell.primaryAxisSizingMode = "AUTO";
						cell.layoutGrow = 0;
					}

					console.log(
						`Cell updated: width = ${cell.width}, primaryAxisSizingMode = ${cell.primaryAxisSizingMode}, layoutGrow = ${cell.layoutGrow}`
					);
				}
			}
		}

		// Second pass: Calculate max widths for body cells

		const columnMaxWidths = new Array(columns).fill(0);
		for (
			let rowIndex = bodyStartIndex;
			rowIndex < selectedTable.children.length;
			rowIndex++
		) {
			const row = selectedTable.children[rowIndex] as FrameNode;
			for (let colIndex = 0; colIndex < columns; colIndex++) {
				const cell = row.children[colIndex] as FrameNode;
				updateMaxWidth(cell, colIndex);
			}
		}

		// Update header cells

		for (let colIndex = 0; colIndex < columns; colIndex++) {
			const headerCell = headerRow.children[colIndex] as FrameNode;

			if (columnValues[colIndex] > 0 && columnValues[colIndex] < 999) {
				headerCell.primaryAxisSizingMode = "FIXED";
				headerCell.layoutGrow = 0;
				headerCell.resize(columnValues[colIndex], headerCell.height);
			} else if (columnValues[colIndex] >= 999) {
				headerCell.primaryAxisSizingMode = "AUTO";
				headerCell.layoutGrow = 1;
			} else {
				headerCell.primaryAxisSizingMode = "FIXED";
				headerCell.layoutGrow = 0;
				headerCell.resize(columnMaxWidths[colIndex], headerCell.height);
			}
		}

		console.log("Final column widths:", columnMaxWidths);

		// Rows
		// Update row count

		const totalRequiredRows = rows + (controls === "on" ? 2 : 1);
		if (selectedTable.children.length < totalRequiredRows) {
			// Add rows
			for (let i = selectedTable.children.length; i < totalRequiredRows; i++) {
				const newRow = figma.createFrame();
				newRow.layoutMode = "HORIZONTAL";
				newRow.counterAxisSizingMode = "AUTO";
				newRow.primaryAxisAlignItems = "MIN";
				newRow.name = `Row ${i - bodyStartIndex + 1}`;

				// Add cells to the new row based on the number of columns
				for (let j = 0; j < columns; j++) {
					const newCell = figma.createFrame();
					newCell.layoutMode = "HORIZONTAL";
					newCell.counterAxisAlignItems = "CENTER";
					newCell.counterAxisSizingMode = "AUTO";
					newCell.paddingLeft = paddingX;
					newCell.paddingRight = paddingX;
					newCell.paddingTop = paddingY;
					newCell.paddingBottom = paddingY;

					if (columnContent[j] === "Chip") {
						const chipInstance = chip.defaultVariant.createInstance();
						newCell.appendChild(chipInstance);
						newCell.layoutAlign = "STRETCH";
						newCell.name = `[Chip] Cell`;
					}
					if (columnContent[j] === "Button") {
						const buttonInstance = button.defaultVariant.createInstance();
						buttonInstance.setProperties({
							Size: "Medium",
							Variant: "Tertiary",
						});
						newCell.appendChild(buttonInstance);
						newCell.name = `[Button] Cell`;
					}
					if (columnContent[j] === "Placeholder") {
						const instance = placeholder.createInstance();
						newCell.appendChild(instance);
						newCell.name = `[Placeholder] Cell`;
					}
					if (columnContent[j] === "Text") {
						const textInstance = text.defaultVariant.createInstance();
						textInstance.setProperties({ "Text Style": "Body" });
						newCell.appendChild(textInstance);
						newCell.layoutAlign = "STRETCH"; // Apply horizontal auto layout
						newCell.name = `[Text] Cell`;
					}

					newRow.appendChild(newCell);
				}

				// Set row name
				newRow.name = `Row ${i + 1}`;
				selectedTable.appendChild(newRow);
			}
		} else if (selectedTable.children.length > totalRequiredRows) {
			// Remove excess rows
			while (selectedTable.children.length > totalRequiredRows) {
				selectedTable.children[selectedTable.children.length - 1].remove();
			}
		}

		// Apply table resizing if needed
		if (resizing == "fixed" && resizingValue > 0) {
			selectedTable.counterAxisSizingMode = "FIXED";
			selectedTable.resize(resizingValue, selectedTable.height);
		}

		figma.closePlugin();
	}

	figma.closePlugin();
};

////////////////////////
//                    //
//  UPDATE SELECTION  //
//                    //
////////////////////////

figma.on("selectionchange", () => {
	// Get the currently selected layers
	const selection = figma.currentPage.selection;
	const selectedColumnContents: string[] = [];
	const columnWidths: number[] = [];

	// Check if there are selected layers
	if (selection.length > 0) {
		// Iterate through each selected layer
		selection.forEach((selectedLayer) => {
			// Check if the selected layer is a frame (table)
			if (selectedLayer.type === "FRAME" && selectedLayer.name === "Table") {
				const tableFrame = selectedLayer as FrameNode;
				let headerRowIndex = 0;
				let firstBodyRowIndex = 1;
				let hasControls = "off";

				// Check for controls
				if (tableFrame.children[0].name === "Table Controls") {
					headerRowIndex = 1;
					firstBodyRowIndex = 2;
					hasControls = "on";
				}

				const headerRow = tableFrame.children[headerRowIndex] as FrameNode;
				const bodyRows = tableFrame.children.slice(
					firstBodyRowIndex
				) as FrameNode[]; // All rows except header

				const columnCount = headerRow.children.length;

				// Initialize columnWidths array with zeros
				const columnWidths: number[] = new Array(columnCount).fill(0);
				const columnMaxWidths: number[] = new Array(columnCount).fill(0);

				// Function to update columnWidths with the widest cell
				const updateColumnWidth = (cell: FrameNode, columnIndex: number) => {
					let cellWidth: number;
					if (cell.layoutGrow === 1 || cell.width > 998) {
						cellWidth = 999; // Indicate "Fill"
					} else {
						cellWidth = Math.round(cell.width);
					}
					columnWidths[columnIndex] = Math.max(
						columnWidths[columnIndex],
						cellWidth
					);
				};

				// Process header row
				headerRow.children.forEach((cell, index) => {
					if (cell.type === "FRAME") {
						updateColumnWidth(cell, index);
					}
				});

				// Process all body rows
				bodyRows.forEach((row) => {
					if (row.type === "FRAME") {
						row.children.forEach((cell, index) => {
							if (cell.type === "FRAME") {
								updateColumnWidth(cell, index);
							}
						});
					}
				});

				// Extract content types from the first body row
				const firstBodyRow = bodyRows[0];
				const selectedColumnContents: string[] = firstBodyRow.children.map(
					(cellFrame) => {
						if (cellFrame.type === "FRAME") {
							const cellName = cellFrame.name || "";
							const contentLabelMatch = cellName.match(/\[(.*?)\]/);
							return contentLabelMatch && contentLabelMatch.length > 1
								? contentLabelMatch[1]
								: "Unknown";
						}
						return "Unknown";
					}
				);

				figma.ui.postMessage({
					type: "selectionChange",
					valid: "valid",
					selection,
					selectedColumnContents,
					columnWidths,
					rowCount: bodyRows.length, // Exclude header from row count
					controls: hasControls,
				});
			} else {
				figma.ui.postMessage({
					type: "selectionChange",
					valid: "invalid",
					selection,
					selectedColumnContents,
					columnWidths,
				});
			}
		});
	} else {
		figma.ui.postMessage({
			type: "selectionChange",
			valid: "valid",
			selection,
			selectedColumnContents,
			columnWidths,
		});
	}
});
