import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

const useStyles = makeStyles({
	root: {
		//width: '80%',
		width: '100%',
	},
	container: {
		maxHeight: '450px',
	},
	normalRow: {
		backgroundColor: 'white',
		"&:hover": {
			 "& $rowDeleteButton": {
				display: "inline-block"
			 }
		}
	},
	flaggedRow: {
		backgroundColor: 'rgba(244, 67, 54, 0.3)',
		"&:hover": {
			 backgroundColor: "rgba(244, 67, 54, 0.38) !important",
			 "& $rowDeleteButton": {
				display: "inline-block"
			 }
		}
	},
	matchedRow: {
		backgroundColor: 'rgba(0, 41, 132, 0.3)',
		"&:hover": {
			 backgroundColor: "rgba(0, 41, 132, 0.38) !important",
			 "& $rowDeleteButton": {
				display: "inline-block"
			 }
		}
	},
	rowDeleteButton: {
		display: 'none'
	}
});

function FixedHeadTable(props) {
	//export default function StickyHeadTable() {
	const classes = useStyles();
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(+event.target.value);
		setPage(0);
	};

	function getRowStyle(row) {
		if ("shouldFlag" in row && row["shouldFlag"]) {
			return classes.flaggedRow;
		}
		else if ("assignedDriver" in row && row["assignedDriver"] != null) {
			return classes.matchedRow;
		}
		else {
			return classes.normalRow;
		}
	}

	return (
		<Paper className={classes.root}>
			<TableContainer className={classes.container}>
				<Table stickyHeader aria-label="sticky table">
					<TableHead>
						<TableRow>
							{props.columns.map((column) => (
								<TableCell
									key={column.id}
									align={column.align}
									style={{ minWidth: column.minWidth }}
								>
									{column.label}
								</TableCell>
							))}
							<TableCell padding="checkbox">
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{props.rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
							return (
								<TableRow hover onClick={ (event) => {props.rowOnClick(event, row)} } role="checkbox" tabIndex={-1} key={row.code} className={getRowStyle(row)}>
									{props.columns.map((column) => {
										const value = row[column.id];
										return (
											<TableCell key={column.id} align={column.align}>
												{column.format && typeof value === 'number' ? column.format(value) : value}
											</TableCell>
										);
									})}
									<TableCell padding="checkbox">
										<IconButton className={classes.rowDeleteButton} aria-label="delete" onClick={(event)=>{props.deleteOnClick(event, row)}}>
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
			<TablePagination
				rowsPerPageOptions={[10, 25, 100]}
				component="div"
				count={props.rows.length}
				rowsPerPage={rowsPerPage}
				page={page}
				onChangePage={handleChangePage}
				onChangeRowsPerPage={handleChangeRowsPerPage}
			/>
		</Paper>
	);
}
 
export default FixedHeadTable;