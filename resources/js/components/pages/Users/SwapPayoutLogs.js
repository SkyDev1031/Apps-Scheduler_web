import moment from "moment";
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { useCallback, useEffect, useState } from 'react';
import { swapFeeLogApi } from '../../api/OriginAPI.js';
import { NumberView } from "../../components";
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { toast_error } from '../../utils';

const SwapPayoutLogs = () => {
    const [query, setQuery] = useState();
    const [data, setData] = useState([])
    const { setLoading } = useGlobalContext();
    useEffect(() => {
        getData();
    }, [getData])

    const getData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await swapFeeLogApi();
            setData(res.logs)
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
                <div className="justify-content-end d-flex">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by keyword" />
                    </span>
                </div>
            )}
        >
            <Column key={'Date'} header={'Date'} field={'DateOfPayout'} sortable
                body={rowData => moment(rowData.DateOfPayout).format('lll')}
            />
            <Column key={'SwapFeesCollected'} field={'SwapFeesCollected'} header={'Total Fees Collected'} sortable
                className='warning-text'
                body={rowData => (
                    <>
                        <NumberView value={rowData.SwapFeesCollected} decimal={6} color={"#ffba00"} /> {rowData.CryptoName}
                    </>
                )}
            />
            <Column key={'SwapPercentage'} field={'SwapPercentage'} header={'Swap Percentage'} sortable
                className='success-text'
                body={rowData => (
                    <>
                        <NumberView value={rowData.SwapPercentage} decimal={2} color={'#00a654'} /> %
                    </>
                )}
            />
        </DataTable>
    )
};

export default SwapPayoutLogs;