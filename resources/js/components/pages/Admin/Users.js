import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { FilterMatchMode } from 'primereact/api';
import { getUsersApi } from '../../api/UserAPI.js'; // Import the new API function
import { useGlobalContext } from "../../contexts/index.js";
import { toast_error } from '../../utils/index.js';
import { _ERROR_CODES } from '../../config/index.js';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState('');
    const { setLoading } = useGlobalContext();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        setLoading(true);
        getUsersApi()
            .then(res => {
                setUsers(res.data); // Update the state with the fetched users
            })
            .catch(err => {
                toast_error(err, _ERROR_CODES.NETWORK_ERROR);
            })
            .finally(() => setLoading(false));
    };

    return (
        <div>
            <h3>Users</h3>
            <DataTable
                value={users}
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
                        <button onClick={fetchUsers} className="btn btn-default"><i className="fa fa-refresh" /> Reload</button>
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
                    key="fullname"
                    header="Full Name"
                    field="fullname"
                    sortable
                />
                <Column
                    key="email"
                    header="Email"
                    field="email"
                    sortable
                />
                <Column
                    key="phone"
                    header="Phone"
                    field="phone"
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
                    key="registeredTime"
                    header="Registered Time"
                    field="registeredTime"
                    sortable
                />
            </DataTable>
        </div>
    );
};

export default Users;