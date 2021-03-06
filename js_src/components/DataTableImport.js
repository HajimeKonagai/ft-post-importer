import { useState, useEffect } from 'react'

import Encoding from 'encoding-japanese'

const DataTableImport = (props) =>
{
	const encode = (value) =>
	{
		return Encoding.convert(value, {to: 'UNICODE', from: props.encoding})
	}

	const valReplace = (value, replace) =>
	{
		let newValue = value.toString();
		replace.map((rep) => {
			newValue = newValue.replace(rep.from, rep.to);
		});

		return newValue;
	}

	const [ live, setLive ] = useState(false);
	const [ importRunning, setImportRunning ] = useState(false);
	const [ importData, setImportData ] = useState({});
	const [ importResult, setImportResult ] = useState({});

	useEffect(() => {
		if (live) setImportRunning(true);
	}, [live]);

	useEffect(() => {
		if (importRunning) runImport();
	}, [importRunning]);

	useEffect(() => {
		if (importRunning) runImport();
	}, [importResult]);


	const runImport = () =>
	{
		if (!importRunning) return;

		const postData = Object.keys(importData).slice(0, 5);
		if (postData.length <= 0)
		{
			setImportRunning(false);
			setLive(false);
			return;
		}

		let params = new FormData();
		params.append('action', 'ft_post_importer');
		for (let i = 0; i < props.postTypes.length; i++)
		{
			const postType = props.postTypes[i];
			params.append('post_types['+i+']', postType);
		}
		if (props.importSetting.emptyValue) params.append('setting[empty_value]', true);
		if (props.importSetting.multiple)   params.append('setting[multiple]',    true);
		if (props.importSetting.create)     params.append('setting[create]',      true);



		if (live) params.append('live', true)

		params.append('search[to]', props.searchField.to);
		params.append('search[compare]', props.searchField.compare);



		postData.map((key) =>
		{
			let post = {};
			const item = props.data[key];
			if (props.importFields)
			{
				const searchValue = valReplace(
					encode(item[props.searchField.from]),
					props.searchField.replace
				);
				params.append('posts[' + key + '][search]', searchValue);

				props.importFields.map((importField) =>
				{
					// if (item[importField.from])
					const value = valReplace(
						encode(item[importField.from]),
						importField.replace
					);
					params.append('posts[' + key + '][fields][' + importField.to + ']', value);
				});
			}
		});

		console.log(params);
		// live run
		// ??????????????????????????????
		// 2??????????????????????????????????????????????????????????????????????????????
		// ???????????? 0 ??????????????????????????????????????????


		fetch(props.api_url,
		{
			method: 'POST', // *GET, POST, PUT, DELETE, etc.
			body: params, // JSON.stringify(data),
			cache: 'no-cache',
			// headers: { 'Content-Type': 'application/json' },
		})
		.then(response => response.json())
		.then((result) =>
		{
			console.log('result');
			console.log(result);
			const newImportData = {...importData};
			const newResult = {...importResult};
			for (let index in result)
			{
				delete newImportData[index];
				newResult[index] = result[index];
			}
			setImportData(newImportData);
			setImportResult(newResult);
		});

		// ??????????????????????????????????????????
		// 
	}

	const check = (i) =>
	{
		const newData = {...importData};
		if (newData[i])
		{
			delete newData[i];
		}
		else
		{
			newData[i] = {
				result: {},
			};
		}

		console.log(newData);

		setImportData(newData);
	}

	const checkAll = () =>
	{
		const newData = {};
		props.data.map((item, i) =>
		{
			newData[i] = { result: '' };
		});
		console.log(newData);
		setImportData(newData);
	}
	const uncheckAll = () =>
	{
		setImportData({});
	}

	return(<>
		<ul>
			<li>
				<label>
					<input type="checkbox" checked={props.importSetting.emptyValue} onChange={ () => props.changeImportSetting('emptyValue') } />
					?????????????????????????????????????????????????????????????????????
				</label>
			</li>
			<li>
				<label>
					<input type="checkbox" checked={props.importSetting.multiple} onChange={ () => props.changeImportSetting('multiple') } />
					???????????????2??????????????????????????????????????????????????????
				</label>
			</li>
			<li>
				<label>
					<input type="checkbox" checked={props.importSetting.create} onChange={ () => props.changeImportSetting('create') } />
					???????????????0????????????????????????????????????
				</label>
			</li>
		</ul>

		{!importRunning &&
			<>
			<button onClick={() => setImportRunning(true )}>???????????????</button>
			<button onClick={() => setLive(true)}>???????????????</button>
			</>
		}
		{importRunning &&
			<>
			<button onClick={() => {
				setImportRunning(false);
				setLive(false);
			}}>???????????????</button>
			??????{Object.keys(importData).length}
			</>
		}
		
		<table className="widefat">
			<thead>
				<tr>
					<th>
						?????????????????????
						<button onClick={ checkAll }>????????????</button>
						<button onClick={ uncheckAll }>??????</button>
					</th>
					<th>??????[{props.searchField.from}]???[
						{props.postTypeFields.find(element => props.searchField.to == element.name) ?
						props.postTypeFields.find(element => props.searchField.to == element.name).label: props.searchField.to}
					]</th>

					{props.importFields &&
						props.importFields.map((item, key) =>
						{
							return <th>[{item.from}]???[
								{props.postTypeFields.find(element => item.to == element.name)  ?
								props.postTypeFields.find(element => item.to == element.name).label: item.to}
							]??????????????????</th>
						})
					}

					<th>??????</th>
				</tr>
			</thead>
			<tbody>
			{
				props.data.map((item, i) =>
				{
					return (<tr>

						<th><input type="checkbox" checked={importData[i]} onChange={ () => check(i)} /></th>
						<td>{
							valReplace(
								encode(item[props.searchField.from]),
								props.searchField.replace
							)
						}</td>
						{props.importFields &&
							props.importFields.map((importField, key) =>
							{
								return <td>
									{item[importField.from] &&
										valReplace(
											encode(item[importField.from]),
											importField.replace
										)
									}
								</td>
							})
						}
						<td>
						{importResult[i] &&
							<ImportResult
								result={importResult[i]}
							/>
						}
						</td>

					</tr>)
				})
			}
			</tbody>
		</table>
	</>);
}

const ImportResult = ({result}) =>
{
	const style = {};
	if (result.status == 'error') style.color = 'red';

	return (<div>
		<span>[
			{result.live ? '??????': '?????????'}
		]</span>
		<span style={style}>
			[{result.status}]
			{result.message && result.message}
		</span>
		<ul>
		{result.import_result && Object.keys(result.import_result).map((irk) =>
		{
			const ir = result.import_result[irk];
			return (<li>
				{ir.view && <a href={ir.view}>??????</a>}
				{ir.edit && <a href={ir.edit}>??????</a>}
				{ir.change && Object.keys(ir.change).map((ck) => {
					return (<span>
						{ck}:
						"{0 in ir.change[ck] && ir.change[ck][0]}" ???
						"{1 in ir.change[ck] && ir.change[ck][1]}"
					</span>);
				})}
			</li>)
		})}
		</ul>
	</div>);
}

export default DataTableImport;
