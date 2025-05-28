import moment from "moment";
import { Rating } from 'primereact';
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { useCallback, useEffect, useState } from 'react';
import { salesFeedbackApi } from '../../api/OriginAPI.js';
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { toast_error } from '../../utils';

const Wallets = () => {
    const [query, setQuery] = useState();
    const [data, setData] = useState([])
    const { setLoading } = useGlobalContext();
    useEffect(() => {
        getData();
    }, [getData])

    const getData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await salesFeedbackApi();
            setData(res.feedback)
        } catch (error) {
            toast_error(error, _ERROR_CODES.NETWORK_ERROR);
        } finally {
            setLoading(false);
        }
    }, [data])

    return (
        <DataTable value={data} responsiveLayout="scroll" stripedRows paginator
            resizableColumns columnResizeMode="fit" showGridlines
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
            filters={{ 'global': { value: query, matchMode: FilterMatchMode.CONTAINS } }}
            header={() => (
                < div className="justify-content-end d-flex">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by keyword" />
                    </span>
                </div>
            )}
        >
            <Column key={'Date'} header={'Date'} field={'DateTime'} sortable
                body={rowData => moment(rowData.DateTime).format('lll')}
            />
            <Column key={'username'} header={'Buyer'} field={'username'} sortable />
            <Column key={'ItemName'} header={'Product Name'} field={'ItemName'} sortable />
            <Column key={'Price'} header={'Price'} field={'Price'} sortable
                body={rowData => `$${rowData.Price}`} />
            <Column key={'Rating'} header={'Rating'} field={'Rating'} sortable
                body={rowData => (
                    <Rating stars={5} value={rowData.Rating} onIconProps={{ style: { color: "#fc0" } }} readOnly cancel={false} />
                )}
            />
            <Column key={'Comments'} field={'Comments'} header={'Comments'} sortable style={{ with: "20%" }} />
        </DataTable >
    )
};

export default Wallets;