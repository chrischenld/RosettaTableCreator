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
	selectable: string;
}

const placeholderKey = "da46e04ae5b772b2dd30fba52d8dc28fcbfca356";
const chipKey = "8618d3bb686bcfbb33425f4b42704f1264fcdf46";
const buttonKey = "a71c22b65bd0196cb0e0607116fec86e868eef2c";
const textKey = "60c7eaa5339ef7b05e3e31654d321ba7b7464384";
const controlsKey = "9374940291a35821c2e09cdec0dab07fad9c050c";
const checkboxKey = "ffa52dadd0bd34b004e2b3cab3d2d07378e9abbf";

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
	const checkbox = await figma.importComponentSetByKeyAsync(checkboxKey);

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
			selectable,
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

		if (selectable === "on") {
			const checkboxHeaderCell = figma.createFrame();
			checkboxHeaderCell.name = `[Checkbox] Header Cell`;
			checkboxHeaderCell.layoutMode = "HORIZONTAL";
			checkboxHeaderCell.counterAxisAlignItems = "CENTER";
			checkboxHeaderCell.primaryAxisSizingMode = "FIXED";
			checkboxHeaderCell.counterAxisSizingMode = "FIXED";
			checkboxHeaderCell.resize(44, checkboxHeaderCell.height); // Set width to 44px
			checkboxHeaderCell.layoutAlign = "STRETCH"; // Fill vertical height

			// You might want to add a specific header content for the checkbox column
			// For example, a "Select All" checkbox or just leave it empty

			headerRow.appendChild(checkboxHeaderCell);
			bodyCellWidths.push(44); // Add checkbox cell width to bodyCellWidths
		}

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

			if (selectable === "on") {
				const checkboxCell = figma.createFrame();
				checkboxCell.name = `[Checkbox] Cell`;
				checkboxCell.layoutMode = "HORIZONTAL";
				checkboxCell.counterAxisAlignItems = "CENTER";
				checkboxCell.counterAxisSizingMode = "AUTO";
				checkboxCell.primaryAxisSizingMode = "FIXED";
				checkboxCell.resize(44, checkboxCell.height);
				checkboxCell.layoutAlign = "STRETCH";
				checkboxCell.paddingLeft = paddingX;
				checkboxCell.paddingRight = paddingX;
				checkboxCell.paddingTop = paddingY;
				checkboxCell.paddingBottom = paddingY;

				// Add a checkbox instance to the cell
				const checkboxInstance = checkbox.defaultVariant.createInstance();
				checkboxInstance.layoutAlign = "CENTER";
				checkboxCell.appendChild(checkboxInstance);

				rowFrame.appendChild(checkboxCell);
			}

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
			// bodyCellWidths.splice(columns);

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
		const headerStartIndex = selectable === "on" ? 1 : 0;
		const bodyWidthStartIndex = selectable === "on" ? 1 : 0;

		for (let col = 0; col < columns; col++) {
			const headerCell = headerCells[col + headerStartIndex] as FrameNode;
			const bodyCellWidth = bodyCellWidths[col + bodyWidthStartIndex];

			if (columnValues[col] > 998 || columnValues[col] < 0) {
				headerCell.layoutGrow = 1;
			} else if (columnValues[col] > 0) {
				headerCell.primaryAxisSizingMode = "FIXED";
				headerCell.resize(columnValues[col], headerCell.height);
			} else {
				headerCell.primaryAxisSizingMode = "FIXED";
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
			selectable,
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

		// Handle selectable feature
		const hasExistingCheckbox =
			headerRow.children[0].name.includes("[Checkbox]");
		if (selectable === "on" && !hasExistingCheckbox) {
			// Add checkbox column
			addCheckboxColumn(selectedTable, startRowIndex);
		} else if (selectable === "off" && hasExistingCheckbox) {
			// Remove checkbox column
			removeCheckboxColumn(selectedTable, startRowIndex);
		}

		// Columns
		// Update column count for all rows
		const totalColumns = selectable === "on" ? columns + 1 : columns;
		const existingColumnCount = headerRow.children.length;
		for (
			let rowIndex = startRowIndex;
			rowIndex < selectedTable.children.length;
			rowIndex++
		) {
			const row = selectedTable.children[rowIndex] as FrameNode;

			// Remove excess columns first
			while (row.children.length > totalColumns) {
				row.children[row.children.length - 1].remove();
			}

			// Add new columns
			for (
				let colIndex = existingColumnCount;
				colIndex < totalColumns;
				colIndex++
			) {
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
				} else {
					// Body cells
					const contentIndex = selectable === "on" ? colIndex - 1 : colIndex;
					const content = columnContent[contentIndex];
					createCellContent(newCell, content);
				}

				row.appendChild(newCell);
			}
		}

		// Update cell contents and apply layout properties
		const columnMaxWidths = new Array(totalColumns).fill(0);

		for (
			let rowIndex = startRowIndex;
			rowIndex < selectedTable.children.length;
			rowIndex++
		) {
			const row = selectedTable.children[rowIndex] as FrameNode;
			for (let colIndex = 0; colIndex < totalColumns; colIndex++) {
				const cell = row.children[colIndex] as FrameNode;

				if (rowIndex === startRowIndex) {
					// Header row
					if (colIndex === 0 && selectable === "on") {
						cell.name = "[Checkbox] Header Cell";
					} else {
						cell.name = `[Header] Cell ${
							selectable === "on" ? colIndex : colIndex + 1
						}`;
					}
				} else if (colIndex === 0 && selectable === "on") {
					cell.name = "[Checkbox] Cell";
				} else {
					const contentIndex = selectable === "on" ? colIndex - 1 : colIndex;
					const newContent = columnContent[contentIndex];
					const currentCellType = cell.name.match(/\[(.*?)\]/)?.[1] || "";

					if (newContent !== currentCellType) {
						while (cell.children.length > 0) {
							cell.children[0].remove();
						}
						createCellContent(cell, newContent);
						cell.name = `[${newContent}] Cell`;
					}

					if (!cell.name.includes("Checkbox")) {
						applyCellLayout(cell, newContent, columnValues[contentIndex]);
					}
				}
			}
		}

		// Second pass: Calculate max widths
		for (
			let rowIndex = bodyStartIndex;
			rowIndex < selectedTable.children.length;
			rowIndex++
		) {
			const row = selectedTable.children[rowIndex] as FrameNode;
			for (let colIndex = 0; colIndex < totalColumns; colIndex++) {
				const cell = row.children[colIndex] as FrameNode;
				updateMaxWidth(cell, colIndex, columnMaxWidths);
			}
		}

		// Update header cells
		for (let colIndex = 0; colIndex < totalColumns; colIndex++) {
			const headerCell = headerRow.children[colIndex] as FrameNode;
			const contentIndex = selectable === "on" ? colIndex - 1 : colIndex;

			if (colIndex === 0 && selectable === "on") {
				// Checkbox header cell
				headerCell.resize(44, headerCell.height);
				headerCell.primaryAxisSizingMode = "FIXED";
				headerCell.layoutGrow = 0;
			} else {
				applyCellLayout(headerCell, "Header", columnValues[contentIndex]);
				if (columnValues[contentIndex] === 0) {
					headerCell.resize(columnMaxWidths[colIndex], headerCell.height);
				}
			}
		}

		// Update row count
		updateRowCount(selectedTable, rows, controls, totalColumns, columnContent);

		// Apply table resizing if needed
		if (resizing == "fixed" && resizingValue > 0) {
			selectedTable.counterAxisSizingMode = "FIXED";
			selectedTable.resize(resizingValue, selectedTable.height);
		}

		figma.closePlugin();
	}

	function addCheckboxColumn(table: FrameNode, startRowIndex: number) {
		for (let i = startRowIndex; i < table.children.length; i++) {
			const row = table.children[i] as FrameNode;
			const checkboxCell = figma.createFrame();
			checkboxCell.name =
				i === startRowIndex ? "[Checkbox] Header Cell" : "[Checkbox] Cell";
			checkboxCell.layoutMode = "HORIZONTAL";
			checkboxCell.counterAxisAlignItems = "CENTER";
			checkboxCell.primaryAxisSizingMode = "FIXED";
			checkboxCell.resize(44, checkboxCell.height);
			checkboxCell.layoutAlign = "STRETCH";
			checkboxCell.paddingLeft = paddingX;
			checkboxCell.paddingRight = paddingX;
			checkboxCell.paddingTop = paddingY;
			checkboxCell.paddingBottom = paddingY;

			if (i > startRowIndex) {
				const checkboxInstance = checkbox.defaultVariant.createInstance();
				checkboxInstance.layoutAlign = "CENTER";
				checkboxCell.appendChild(checkboxInstance);
			}

			row.insertChild(0, checkboxCell);
		}
	}

	function removeCheckboxColumn(table: FrameNode, startRowIndex: number) {
		for (let i = startRowIndex; i < table.children.length; i++) {
			const row = table.children[i] as FrameNode;
			if (row.children[0].name.includes("[Checkbox]")) {
				row.children[0].remove();
			}

			// Rename remaining cells in the header row
			if (i === startRowIndex) {
				for (let j = 0; j < row.children.length; j++) {
					const cell = row.children[j] as FrameNode;
					cell.name = `[Header] Cell ${j + 1}`;
				}
			}
		}
	}

	function createCellContent(cell: FrameNode, content: string) {
		if (content === "Chip") {
			const chipInstance = chip.defaultVariant.createInstance();
			cell.appendChild(chipInstance);
		} else if (content === "Button") {
			const buttonInstance = button.defaultVariant.createInstance();
			buttonInstance.setProperties({ Size: "Medium", Variant: "Tertiary" });
			cell.appendChild(buttonInstance);
		} else if (content === "Placeholder") {
			const instance = placeholder.createInstance();
			cell.appendChild(instance);
		} else if (content === "Text") {
			const textInstance = text.defaultVariant.createInstance();
			textInstance.setProperties({ "Text Style": "Body" });
			cell.appendChild(textInstance);
		}
	}

	function applyCellLayout(
		cell: FrameNode,
		content: string,
		columnValue: number
	) {
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

		if (columnValue > 0 && columnValue < 999) {
			cell.primaryAxisSizingMode = "FIXED";
			cell.layoutGrow = 0;
			cell.resize(columnValue, cell.height);
		} else if (columnValue >= 999) {
			cell.primaryAxisSizingMode = "AUTO";
			cell.layoutGrow = 1;
		} else {
			cell.primaryAxisSizingMode = "AUTO";
			cell.layoutGrow = 0;
		}
	}

	function updateMaxWidth(
		cell: FrameNode,
		colIndex: number,
		columnMaxWidths: number[]
	) {
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
	}

	function updateRowCount(
		table: FrameNode,
		rows: number,
		controls: string,
		totalColumns: number,
		columnContent: string[]
	) {
		const startRowIndex = controls === "on" ? 1 : 0;
		const bodyStartIndex = startRowIndex + 1;
		const totalRequiredRows = rows + (controls === "on" ? 2 : 1);

		if (table.children.length < totalRequiredRows) {
			// Add rows
			for (let i = table.children.length; i < totalRequiredRows; i++) {
				const newRow = figma.createFrame();
				newRow.layoutMode = "HORIZONTAL";
				newRow.counterAxisSizingMode = "AUTO";
				newRow.primaryAxisAlignItems = "MIN";
				newRow.name = `Row ${i - bodyStartIndex + 1}`;

				// Add cells to the new row
				for (let j = 0; j < totalColumns; j++) {
					const newCell = figma.createFrame();
					newCell.layoutMode = "HORIZONTAL";
					newCell.counterAxisAlignItems = "CENTER";
					newCell.counterAxisSizingMode = "AUTO";
					newCell.paddingLeft = paddingX;
					newCell.paddingRight = paddingX;
					newCell.paddingTop = paddingY;
					newCell.paddingBottom = paddingY;

					if (j === 0 && totalColumns > columnContent.length) {
						// This is a checkbox cell
						newCell.name = "[Checkbox] Cell";
						const checkboxInstance = checkbox.defaultVariant.createInstance();
						newCell.appendChild(checkboxInstance);
					} else {
						const contentIndex =
							totalColumns > columnContent.length ? j - 1 : j;
						createCellContent(newCell, columnContent[contentIndex]);
					}

					newRow.appendChild(newCell);
				}

				table.appendChild(newRow);
			}
		} else if (table.children.length > totalRequiredRows) {
			// Remove excess rows
			while (table.children.length > totalRequiredRows) {
				table.children[table.children.length - 1].remove();
			}
		}
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
				let headerRow = tableFrame.children[0] as FrameNode;
				let firstBodyRow = tableFrame.children[1] as FrameNode;
				let bodyRows = tableFrame.children.slice(1) as FrameNode[];
				let hasControls = "off";
				let selectable = "off";

				if (selectedLayer.children[0].name === "Table Controls") {
					headerRow = tableFrame.children[1] as FrameNode;
					firstBodyRow = tableFrame.children[2] as FrameNode;
					bodyRows = tableFrame.children.slice(2) as FrameNode[];
					hasControls = "on";
				}

				// Check if the table is selectable
				if (firstBodyRow.children[0].name === "[Checkbox] Cell") {
					selectable = "on";
				}

				const totalColumnCount = headerRow.children.length;
				const dataColumnCount =
					selectable === "on" ? totalColumnCount - 1 : totalColumnCount;

				// Initialize columnWidths array with zeros
				const columnWidths: number[] = new Array(dataColumnCount).fill(0);

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
						// Skip the checkbox cell if present
						if (index === 0 && selectable === "on") return;
						const adjustedIndex = selectable === "on" ? index - 1 : index;
						updateColumnWidth(cell, adjustedIndex);
					}
				});

				// Process all body rows
				bodyRows.forEach((row) => {
					if (row.type === "FRAME") {
						row.children.forEach((cell, index) => {
							if (cell.type === "FRAME") {
								// Skip the checkbox cell if present
								if (index === 0 && selectable === "on") return;
								const adjustedIndex = selectable === "on" ? index - 1 : index;
								updateColumnWidth(cell, adjustedIndex);
							}
						});
					}
				});

				const selectedColumnContents: string[] = [];

				// Extract content types from the first body row
				firstBodyRow.children.forEach((cellFrame, index) => {
					if (cellFrame.type === "FRAME") {
						// Skip the checkbox cell if present
						if (index === 0 && selectable === "on") return;
						const cellName = cellFrame.name || "";
						const contentLabelMatch = cellName.match(/\[(.*?)\]/);
						if (contentLabelMatch && contentLabelMatch.length > 1) {
							selectedColumnContents.push(contentLabelMatch[1]);
						} else {
							selectedColumnContents.push("Unknown");
						}
					}
				});

				figma.ui.postMessage({
					type: "selectionChange",
					valid: "valid",
					selection,
					selectedColumnContents,
					columnWidths,
					rowCount: bodyRows.length,
					controls: hasControls,
					selectable: selectable,
					totalColumnCount: totalColumnCount,
					dataColumnCount: dataColumnCount,
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
