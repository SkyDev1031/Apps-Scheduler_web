import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { FilterMatchMode } from 'primereact/api';
import { getParticipantsApi, allowParticipantApi, blockParticipantApi, deleteParticipantApi } from '../../api/ParticipantAPI.js';
import { useGlobalContext } from "../../contexts";
import { toast_success, toast_error } from '../../utils/index.js';
import { _ERROR_CODES } from '../../config';

const Participants = () => {
    const [participants, setParticipants] = useState([]);
    const [query, setQuery] = useState('');
    const { setLoading, confirmDialog } = useGlobalContext();

    useEffect(() => {
        console.log("Hello Participant");
        getParticipants();
    }, []);

    const getParticipants = () => {
        setLoading(true);
        getParticipantsApi()
            .then(res => { setParticipants(res.data); })
            .catch(err => { toast_error(err, _ERROR_CODES.NETWORK_ERROR); })
            .finally(() => setLoading(false));
    };

    const handleAllow = (participant) => {
        setLoading(true);
        const id = participant.id;
        allowParticipantApi(id)
            .then(res => {
                console.log(res)
                if (res.status === true) {
                    // Update the participant's status in the state
                    setParticipants(prevParticipants =>
                        prevParticipants.map(p =>
                            p.id === id ? { ...p, status: 'active' } : p
                        )
                    );
                    toast_success(res.message);
                } else {
                    toast_error(res.message, _ERROR_CODES.NETWORK_ERROR);
                }
            })
            .catch(err => {
                toast_error(err, _ERROR_CODES.NETWORK_ERROR);
            })
            .finally(() => setLoading(false));
    };

    const handleBlock = (participant) => {
        setLoading(true);
        const id = participant.id;
        blockParticipantApi(id)
            .then(res => {
                if (res.status === true) {
                    // Update the participant's status in the state
                    setParticipants(prevParticipants =>
                        prevParticipants.map(p =>
                            p.id === id ? { ...p, status: 'block' } : p
                        )
                    );
                    toast_success(res.message);
                } else {
                    toast_error(res.message, _ERROR_CODES.NETWORK_ERROR);
                }
            })
            .catch(err => {
                toast_error(err, _ERROR_CODES.NETWORK_ERROR);
            })
            .finally(() => setLoading(false));
    };

    const handleDelete = async (participant) => {
        const isDelete = await confirmDialog();
        if (!isDelete) return;
        
        setLoading(true);
        const id = participant.id;
        deleteParticipantApi(id)
            .then(res => {
                if (res.status === true) {
                    // Remove the participant from the state
                    setParticipants(prevParticipants =>
                        prevParticipants.filter(p => p.id !== id)
                    );
                    toast_success(res.message);
                } else {
                    toast_error(res.message, _ERROR_CODES.NETWORK_ERROR);
                }
            })
            .catch(err => {
                toast_error(err, _ERROR_CODES.NETWORK_ERROR);
            })
            .finally(() => setLoading(false));
    };

    return (
        <div>
            <h3>Participants</h3>
            <DataTable
                value={participants}
                responsiveLayout="scroll"
                stripedRows
                paginator
                resizableColumns
                columnResizeMode="fit"
                showGridlines
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                rows={10}
                rowsPerPageOptions={[10, 20, 50]}
                filters={{ global: { value: query, matchMode: FilterMatchMode.CONTAINS } }}
                header={() => (
                    <div className="d-flex">
                        <button onClick={getParticipants} className="btn btn-default"><i className="fa fa-refresh" /> Reload</button>
                        <div className="ms-auto p-2">
                            <span className="p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search by keyword"
                                />
                            </span>
                        </div>
                    </div>
                )}
            >
                <Column
                    key="no"
                    header="No"
                    field="no"
                    sortable
                />
                <Column
                    key="userID"
                    header="ParticipantID"
                    field="userID"
                    sortable
                />
                <Column
                    key="status"
                    header="Status"
                    field="status"
                    body={(rowData) => (
                        <span
                            className={`${
                                rowData.status === 'active'
                                    ? 'bg-primary text-white'
                                    : rowData.status === 'block'
                                    ? 'bg-danger text-white'
                                    : 'bg-warning text-white'
                            } px-2 py-1 rounded`}
                        >
                            {rowData.status}
                        </span>
                    )}
                    sortable
                />
                <Column
                    key="created_at"
                    header="RegisteredTime"
                    field="created_at"
                    sortable
                />
                <Column
                    key="actions"
                    header="Actions"
                    body={(rowData) => (
                        <div className="table-action">
                            <Button
                                label="Allow"
                                className="p-button-rounded p-button-primary m-1"
                                onClick={() => handleAllow(rowData)}
                            />
                            <Button
                                label="Block"
                                className="p-button-rounded p-button-danger m-1"
                                onClick={() => handleBlock(rowData)}
                            />
                            <Button
                                label="Delete"
                                className="p-button-rounded p-button-secondary m-1"
                                onClick={() => handleDelete(rowData)}
                            />
                        </div>
                    )}
                />
            </DataTable>
        </div>
    );
};

export default Participants;