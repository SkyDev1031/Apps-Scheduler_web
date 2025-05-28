import { Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, IconButton, Radio, RadioGroup, TextField } from '@mui/material';
import { Button, Column, DataTable, InputText } from 'primereact';
import { FilterMatchMode } from 'primereact/api';
import { useEffect, useState } from 'react';
import { deleteDiscussionApi, discussionsApi, updateDiscussionApi } from '../../api/OriginAPI.js';
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { toast_error, toast_success } from '../../utils';

const _ACT_TYPE = {
    DEFAULT: -1,
    ADD: 0,
    EDIT: 1,
    DELETE: 2,
    VIEW: 3,
}
const Discussions = () => {
    const [data, setData] = useState([]);
    const [packageNames, setPackageNames] = useState([]);
    const [query, setQuery] = useState('')
    const { setLoading, confirmDialog } = useGlobalContext();
    const [selectedItem, setSelectedItem] = useState({
        visible: false,
        type: _ACT_TYPE.DEFAULT,
        data: {}
    })
    const _data = selectedItem.data || {};
    const _isAdd = selectedItem.type == _ACT_TYPE.ADD;
    const _isEdit = selectedItem.type == _ACT_TYPE.EDIT;
    // const [selectedFile, setSelectedFile] = useState(null)
    // const fileInput = useRef();

    useEffect(() => {
        getDiscussions();
    }, [])
    const getDiscussions = () => {
        setLoading(true)
        discussionsApi()
            .then(res => {
                console.log("Admin Discussion.js discussionApi = : ", res);
                setData(res.data);
                setPackageNames(res.packages)
            })
            .catch(error => toast_error(error, _ERROR_CODES.NETWORK_ERROR))
            .finally(() => setLoading(false));
    }

    const updateSelectionData = (item) => {
        setSelectedItem(bef => ({ ...bef, data: { ...bef.data, ...item } }));
    };
    const initSelection = (item = {}) => setSelectedItem({ ...item });

    const onAction = async (data, type) => {
        if (type == _ACT_TYPE.DELETE) {
            const isDelete = await confirmDialog();
            if (!isDelete) return;
            const res = await deleteDiscussionApi(data.id)
                .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
            if (res?.success) {
                toast_success(res?.message);
                getDiscussions();
            }
        } else {
            initSelection({ type, data, visible: true });
        }
    }
    const handleAction = async () => {
        if (!_data.Title) return toast_error('Please enter the Discussion Title.', _ERROR_CODES.INVALID_INPUT);
        if (!_data.Description) return toast_error('Please enter the Discussion Description.', _ERROR_CODES.INVALID_INPUT);
        setLoading(true);
        var res;
        if (_data.Package === undefined) {
            _data["Package"] = packageNames[0].PackageName;
        }
        console.log("Admin Discussion.js handleAction = : ", _data);
        res = await updateDiscussionApi(_data)
            .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
        if (res?.success) {
            toast_success(res?.message);
            initSelection();
            getDiscussions();
        }
    }
    // const onChange = async (event) => {
    //     const file = event.target.files[0];
    //     const url = URL.createObjectURL(file)
    //     setSelectedFile({file, url});
    // }

    return (
        <>
            {/* <input
                ref={fileInput}
                type="file"
                accept="image/*"
                style={{display: 'none'}}
                onChange={onChange}
            /> */}
            <DataTable value={data} responsiveLayout="scroll" stripedRows paginator
                resizableColumns columnResizeMode="fit" showGridlines
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
                filters={{ 'global': { value: query, matchMode: FilterMatchMode.CONTAINS } }}
                header={() => (
                    <div className="justify-content-between d-flex">
                        <Button label='Add New Group Discussion' onClick={() => onAction({ id: 0 }, _ACT_TYPE.ADD)} />
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by keyword" />
                        </span>
                    </div>
                )}
            >
                <Column key={'Description'} header={'Title'} field={'Title'} sortable
                    body={(rowData => (
                        <div className='crypto-cell'>
                            <span>{rowData.Title}</span>
                        </div>
                    ))}
                />
                <Column key={'Description'} header={'Description'} field={'Description'} sortable />
                <Column key={'Package'} header={'Package'} field={'Package'} sortable />
                <Column key={'id'} header={'Action'} field={'id'} sortable
                    body={(rowData) => (
                        <div className='table-action'>
                            <Button label="Edit" className="p-button-rounded m-1" onClick={() => onAction(rowData, _ACT_TYPE.EDIT)} />
                            <Button label="Delete" className="p-button-rounded p-button-danger m-1" onClick={() => onAction(rowData, _ACT_TYPE.DELETE)} />
                            {/* <Button label="View" className="p-button-rounded m-1" onClick={() => onAction(rowData, _ACT_TYPE.VIEW)} /> */}
                        </div>
                    )} />
            </DataTable>
            <Dialog
                open={selectedItem.visible || false}
                onClose={initSelection}
                scroll={'paper'}
                maxWidth={'lg'}
                fullWidth={true}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <DialogTitle id="scroll-dialog-title" className='pt-20'>
                    {_isEdit ? 'Edit Discussion' : 'Add Discussion'}
                    <IconButton
                        aria-label="close"
                        onClick={initSelection}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                        }}
                    >
                        <i className="pi pi-times" />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers={true} className="p-20">
                    <FormControl fullWidth className="p-2">
                        <RadioGroup
                            aria-labelledby="demo-radio-buttons-group-label"
                            // defaultValue={_data.Package || "Pulse"}
                            value={_data.Package || "Pulse"}
                            onChange={(e) => updateSelectionData({ Package: e.target.value })}
                            name="radio-buttons-group"
                        >
                            {packageNames.map((packageName, index) => {
                                return (
                                    <FormControlLabel key={index} value={packageName.PackageName} control={<Radio />} label={`${packageName.PackageName}`} />
                                )
                            })}
                        </RadioGroup>
                    </FormControl>
                    <FormControl fullWidth className="p-2 mb-2">
                        <TextField id="Title" label="Title" required variant="outlined" placeholder='Title'
                            className='mt-4'
                            value={_data.Title || ''}
                            onChange={e => updateSelectionData({ Title: e.target.value })} />
                    </FormControl>
                    <FormControl fullWidth className="p-2">
                        <TextField
                            id="Description" label="Description" required variant="outlined" placeholder='Description'
                            multiline={true}
                            rows={2}
                            maxRows={2}
                            value={_data.Description || ''}
                            onChange={e => updateSelectionData({ Description: e.target.value })} />
                    </FormControl>
                </DialogContent>
                <DialogActions className='table-action p-20'>
                    <Button className='p-button-danger' onClick={initSelection}>Cancel</Button>
                    <Button className='p-button-success' onClick={handleAction}>{'Confirm'}</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
export default Discussions;