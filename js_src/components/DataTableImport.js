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

	const [ importData, setImportData ] = useState({});
	const [ liveRun, setLiveRun ] = useState(false);
	const [ importRunning, setInportRunning ] = useState(false);

	const runImport = () =>
	{
		const postData = {};

		let params = new FormData();
		params.append('action', 'ft_post_importer');
		for (let i = 0; i < postTypes.length; i++)
		{
			const postType = postTypes[i];
			params.append('post_types['+i+']', postType);
		}
		params.append('setting[empty_value]', props.importSetting.emptyValue);
		params.append('setting[multiple]',   props.importSetting.multiple);
		params.append('setting[create]',     props.importSetting.create);


		params.append('search[to]', props.searchField.to);
		params.append('search[compare]', props.searchField.compare);


		Object.keys(importData).map((key) =>
		{
			let post = {};
			const item = props.data[key];
			console.log(props.importFields);
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
		// 空の値で上書きするか
		// 2つ以上の検索結果があったとき、全てにインポートするか
		// 検索結果 0 件だったとき、新規作成するか


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
		});
		// 投げて、検索結果だけまず取る
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
				result: '',
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
		<button onClick={runImport}>テストする</button>

		<label>空の値の場合、すでに値が入っていても上書きする
			<input type="checkbox" checked={props.importSetting.emptyValue} onChange={ () => props.changeImportSetting('emptyValue') } />
		</label>
		<label>検索結果が2つ以上一致した際に、全てに値を入れる
			<input type="checkbox" checked={props.importSetting.multiple} onChange={ () => props.changeImportSetting('multiple') } />
		</label>
		<label>検索結果が0件の場合に、新規作成する
			<input type="checkbox" checked={props.importSetting.create} onChange={ () => props.changeImportSetting('create') } />
		</label>
		<table className="widefat">
			<thead>
				<tr>
					<th>
						インポート対象
						<button onClick={ checkAll }>チェック</button>
						<button onClick={ uncheckAll }>外す</button>
					</th>
					<th>検索[{props.searchField.from}]→[
						{props.postTypeFields.find(element => props.searchField.to == element.name) ?
						props.postTypeFields.find(element => props.searchField.to == element.name).label: props.searchField.to}
					]</th>

					{props.importFields &&
						props.importFields.map((item, key) =>
						{
							return <th>[{item.from}]→[
								{props.postTypeFields.find(element => item.to == element.name)  ?
								props.postTypeFields.find(element => item.to == element.name).label: item.to}
							]にインポート</th>
						})
					}

					<th>結果</th>
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
						<td></td>

					</tr>)
				})
			}
			</tbody>
		</table>
	</>);
}
export default DataTableImport;
