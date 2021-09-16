import React from 'react';
import ReactDOM from 'react-dom';
import { useState, useEffect } from 'react'

import Papa from 'papaparse'

import DataTableImport from './DataTableImport'
import DataTableRaw from './DataTableRaw'

/**
 * 後々、API も足す
 */
const CsvReader = (props) =>
{
	const FileRead = (e) =>
	{
		e.preventDefault();
        e.stopPropagation();
		const files = e.target.files;

		const file = files[0];
		if (!file) return;

		const reader = new FileReader();

		reader.onload = (e) =>
		{
			const result = e.target.result;

			const papa = Papa.parse(result);
			const csvArr = papa.data
			console.log('paraparse', papa.data);
			
			// const csvArr = csvArray(result);

			let colsNum = 0;
			for (let i =0; i < csvArr.length; i++)
			{
				colsNum = Math.max(csvArr[i].length, colsNum);
			}

			console.log(csvArr);

			props.callback(csvArr);
			/*
			this.setState({
				data: csvArr,
				colsNum: colsNum,
			});
			*/
		}

		// reader.readAsArrayBuffer(f);
		reader.readAsBinaryString(file); // TODO fxxk ie
	}

	const csvArray = (data) =>
	{
		// console.log(Encoding.detect(data));
		// data = this.encode(data);
		// console.log(data);
		const dataArray = []; //配列を用意
		const dataString = data.split('\n'); //改行で分割
		for (let i = 0; i < dataString.length; i++)
		{
			dataArray[i] = dataString[i].split(',');
			// dataArray[i][1] = this.encode(dataArray[i][1]);
		}

		return dataArray;
	}


	return(
		<div>
			<label>ファイル
				<input type="file" onChange={FileRead} />
			</label>
		</div>
	);

}

const PostImporter = (props) =>
{
	/**
	 * init
	 */
	useEffect(() => {
		console.log(props.config);

		loadConfig();

	}, []);

	const [ encoding, setEncoding ] = useState('SJIS');
	/*
	useEffect(() =>
	{
		const data = rawData.slice();
		setRawData(data);
	}, [encoding]);
	*/
	/**
	 * PostType Settings
	 */
	const [ postTypes, setPostTypes ] = useState([]);
	const changePostTypes = (post_type) =>
	{
		const newPostTypes = postTypes.slice();
		const findIndex = postTypes.indexOf(post_type);
		if (findIndex > -1)
		{
			newPostTypes.splice(findIndex, 1);
		}
		else
		{
			newPostTypes.push(post_type);
		}
		setPostTypes(newPostTypes);
	}
	const [ postTypeFields, setPostTypeFields ] = useState([]);
	useEffect(() =>
	{
		// TODO 検索フィールド対象の to を戻すか一致していたら放置

		console.log(postTypes);
		console.log(postTypes.length);

		if (postTypes.length < 1)
		{
			setPostTypeFields([]);
			return;
		}



		let _postTypeFields = [];

		for (let i = 0; i < postTypes.length; i++)
		{
			const postType = postTypes[i];
			console.log(postType);
			if (!props.config[postType])
			{
				continue;
			}

			if (props.config[postType].supports)
			{
				const supports = {
					title:   { name: 'post_title', label: 'タイトル' },
					editor:  { name: 'post_content', label: '記事の内容' },
					excerpt: { name: 'post_excerpt', label: '抜粋' },
				};
				for (let sk in supports)
				{
					if (props.config[postType].supports.includes(sk))
					{
						const findIndex = _postTypeFields.findIndex(element => element.name == supports[sk].name);
						if (findIndex > -1)
						{
							_postTypeFields[findIndex].postTypes.push(postType);
						}
						else
						{
							_postTypeFields.push({name: supports[sk].name,   label: supports[sk].label, postTypes: [postType] });
						}
					}
					// props.config[postType].supports.includes('editor')  && _postTypeFields.push({name: 'post_content', label: '記事の内容'});
					// props.config[postType].supports.includes('excerpt') && _postTypeFields.push({name: 'post_excerpt',   label: '抜粋'});
				}
			}

			if (props.config[postType].meta)
			{
				Object.keys(props.config[postType].meta).map((key) =>
				{
					if ('group' == props.config[postType].meta[key].type)
					{
						Object.keys(props.config[postType].meta[key].meta).map((gk) =>
						{
							const findIndex = _postTypeFields.findIndex(element => element.name == gk);
							if (findIndex > -1)
							{
								_postTypeFields[findIndex].postTypes.push(postType);
							}
							else
							{
								_postTypeFields.push({
									name: gk,
									label: props.config[postType].meta[key].meta[gk].label ? props.config[postType].meta[key].meta[gk].label : gk,
									postTypes: [postType]
								});
							}
						});
					}
					else
					{
						const findIndex = _postTypeFields.findIndex(element => element.name == key);
						if (findIndex > -1)
						{
							_postTypeFields[findIndex].postTypes.push(postType);
						}
						else
						{
							_postTypeFields.push({
								name: key,
								label: props.config[postType].meta[key].label ? props.config[postType].meta[key].label : key,
								postTypes: [postType]
							});
						}
					}
				});
			}
		}

		setPostTypeFields(_postTypeFields);
	}, [postTypes]);

	/**
	 * ImportFields
	 */
	const [ searchField, setSearchField ] = useState({
		from: '',
		to: '',
		replace: [],
		compare: '=',
	});
	const changeSearchField = (key, value) =>
	{
		setSearchField((prev) =>
		{
			const next = {...prev};
			next[key] = value;
			return next;
		});
	}
	const addSearchReplace = () =>
	{
		setSearchField((prev) =>
		{
			const next = {...prev};
			next.replace = [...prev.replace, {
				from: '',
				to: '',
			}];
			return next;
		});
	}
	const removeSearchReplace = (i) =>
	{
		console.log('remove');
		setSearchField((prev) =>
		{
			const next = {...prev};
			next.replace.splice(i, 1);
			console.log(next);
			return next;
		});
	}
	const changeSearchReplace = (value, i, key) =>
	{
		setSearchField((prev) =>
		{
			const next = {...prev};
			next.replace[i][key] = value;
			return next;
		});
	}


	const [ importFields, setImportFields ] = useState([]);

	const addImportField = (name) =>
	{
		setImportFields((prev) =>
		{
			return [...prev, {
				from: '',
				to: name,
				replace: [],
			}];
		});
	}
	const deleteImportField = (i) =>
	{
		setImportFields((prev) =>
		{
			const next = prev.slice();
			next.splice(i, 1);
			return next;
		});
	}
	const importToFieldChange = (i, value) =>
	{
		setImportFields((prev) =>
		{
			const next = prev.slice();
			next[i] = {
				from: prev[i].from,
				to: value,
				replace: prev[i].replace,
			};
			return next;
		});
	}
	const importFromFieldChange = (i, value) =>
	{
		setImportFields((prev) =>
		{
			const next = prev.slice();
			next[i] = {
				from: value,
				to: prev[i].to,
				replace: prev[i].replace,
			};
			return next;
		});
	}

	const addImportFieldReplace = (i) =>
	{
		setImportFields((prev) =>
		{
			const next = prev.slice();
			next[i].replace.push({
				from: '',
				to: '',
			});
			return next;
		});
	}
	const removeImportFieldReplace = (i, ri) =>
	{
		setImportFields((prev) =>
		{
			const next = prev.slice();
			next[i].replace.splice(ri, 1);
			return next;
		});
	}

	const changeImportFieldReplace = (value, i, ri, key) =>
	{
		setImportFields((prev) =>
		{
			const next = prev.slice();
			next[i].replace[ri][key] = value;
			return next;
		});
	}

	const [ importSetting, setImportSetting ] = useState({
		// 空の値で上書きするか
		'emptyValue': false,
		// 2つ以上の件区結果があったとき、全てにインポートするか
		'multiple': false,
		// 検索結果 0 件だったとき、新規作成するか
		'create': false,
	});
	const changeImportSetting = (key) =>
	{
		const newSetting = { ...importSetting };
		newSetting[key] = !importSetting[key];
		setImportSetting(newSetting);
	}

	const [ configs, setConfigs ] = useState([]);
	const [ configName, setConfigName ] = useState('')

	useEffect(() => {
		// console.log(configs);
	}, [configs]);

	const addConfig = () =>
	{
		let params = new FormData();
		const newConfig = {
			'configName'    : configName,
			'encoding'      : encoding,
			'postTypes'     : postTypes,
			'searchField'   : searchField,
			'importFields'  : importFields,
			'importSetting' : importSetting,
		};

		configs.push(newConfig);
		saveConfig(configs);
	}

	const deleteConfig = (i) =>
	{
		configs.splice(i, 1);
		saveConfig(configs);
	}

	const saveConfig = (_configs) =>
	{
		console.log(_configs);
		const saveJson = JSON.stringify(_configs);
		let params = new FormData();
		params.append('action', 'ft_post_importer_config');
		params.append('config', saveJson);

		fetch(props.api_url,
		{
			method: 'POST', // *GET, POST, PUT, DELETE, etc.
			body: params, // JSON.stringify(data),
			cache: 'no-cache',
			// headers: { 'Content-Type': 'application/json' },
		})
		.then((response) =>  response.json())
		.then((result) => // result は load と同じ
		{
			console.log('result');
			try
			{
				const newConfigs = JSON.parse(result.config.replaceAll("\\", ''));
				setConfigs(newConfigs);
				console.log('setted');
			}
			catch(e)
			{
				console.log(e);
			}
		});
	}


	const loadConfig = () =>
	{
		let params = new FormData();
		params.append('action', 'ft_post_importer_config');

		fetch(props.api_url,
		{
			method: 'POST', // *GET, POST, PUT, DELETE, etc.
			body: params, // JSON.stringify(data),
			cache: 'no-cache',
			// headers: { 'Content-Type': 'application/json' },
		})
		.then((response) =>  response.json())
		.then((result) => // result は load と同じ
		{
			console.log('result');
			try
			{
				const newConfigs = JSON.parse(result.config.replaceAll("\\", ''));
				setConfigs(newConfigs);
				console.log('setted');
			}
			catch(e)
			{
				console.log(e);
			}
		});
	}

	const applyConfig = (i) =>
	{
		const loadConfig = configs[i];

		// TODO 値の妥当性チェック？

		setConfigName(loadConfig.configName);
		setEncoding(loadConfig.encoding);
		setPostTypes(loadConfig.postTypes);
		setSearchField(loadConfig.searchField);
		setImportFields(loadConfig.importFields);
		setImportSetting(loadConfig.importSetting);

	}


	/*
	useEffect(() =>
	{
		const data = rawData.slice();
		setRawData(data);
	}, [importFields]);
	*/

	/**
	 * 表示関連
	 */
	const [ showRawData, setShowRawData ] = useState(false);

	/**
	 * FromFileds
	 */
	const [ fromFields, setFromFields ] = useState([]);
	const [ rawData, setRawData ] = useState([]);
	const csvRead = (csvArr) =>
	{
		// TODO 書く設定の from フィールドを変える
		setFromFields([...csvArr[0].keys()]);
		setRawData(csvArr);
	}


	return (<div>

		<table className="widefat fixed striped">
			<tbody>
				<tr>
					<th>設定ファイル</th>
					<td>
						<ul>
						{
							configs.map((config, i) =>
							{
								return (<li>
									{ config.configName ? config.configName : i }
									<button onClick={ () => applyConfig(i)}>適用</button>
									<button onClick={ () => deleteConfig(i)}>remove</button>
								</li>);
							})
						}
						</ul>
					</td>
				</tr>
				<tr>
					<th>現在の設定を保存</th>
					<td>
						<input type="text" onChange={ (e) => setConfigName(e.target.value) } placeholder="設定名、同じ名前は上書きされます" size="40" />
						<button onClick={addConfig}>現在の設定を保存</button>
					</td>
				</tr>
				<tr>
					<th>Encoding</th>
					<td>
						<select onChange={(e) => setEncoding(e.target.value)} value={encoding}>
							<option value="SJIS">SJIS</option>
							<option value="EUCJP">EUCJP</option>
							<option value="UTF8">UTF8</option>
						</select>
					</td>
				</tr>
				<tr>
					<th>インポート先ポストタイプ</th>
					<td>
							{Object.keys(props.config).map((key) => {
								return (<label>
									<input type="checkbox" value={key} checked={postTypes.indexOf(key) > -1} onChange={ () => changePostTypes(key) } />
									{props.config[key].label}
								</label>);
							})}
							{ /*
							<select onChange={(e) => { console.log(e.target.value); setPostType(e.target.value)} }>
								<option value=""></option>
							{Object.keys(props.config).map((key) => {
								return <option value={key}>{props.config[key].label}</option>
							})}
							</select>
							*/ }
					</td>
				</tr>
				<tr>
					<th>ファイル読み込み</th>
					<td>
						<CsvReader
							callback={csvRead}
						/>
									</td>
				</tr>
				<tr>
					<th></th>
					<td>
						<label>CSV元データ表示:
							<input type="checkbox" onChange={ (e) => setShowRawData(!showRawData) } checked={showRawData} />
						</label>
					</td>
				</tr>
			</tbody>
		</table>






		<h3>検索対象フィールド</h3>
		<table className="widefat fixed striped">
			<thead>
				<tr>
					<th>ファイルの〜と</th>
					<th>〜を検索</th>
					<th>文字の置き換え</th>
					<th>検索メソッド</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>
						<select
							value={searchField.from}
							onChange={(e) => changeSearchField('from', e.target.value)}
						>
							<option value=""></option>
							{fromFields.map((item) =>
								{
									return <option value={item}>{item}</option>;
								})
							}
						</select>

					</td>
					<td>
						<select
							value={searchField.to}
							onChange={(e) => changeSearchField('to', e.target.value)}
						>
							<option value=""></option>
							<option value="ID">ID</option>
							{postTypeFields.map((item) =>
							{
								return <option value={item.name}>{item.label}</option>
							})}
						</select>
					</td>
					<td>
						<ul>
						{
							searchField.replace.map((v, i) => 
							{
								return (<li>
									<input type="text" value={v.from} size="6" onChange={ (e) => changeSearchReplace(e.target.value, i, 'from') } />
									→
									<input type="text" value={v.to}   size="6" onChange={ (e) => changeSearchReplace(e.target.value, i, 'to') } />
									<button onClick={() => removeSearchReplace(i)}>remove</button>
								</li>);
							})
						}
						</ul>
						<button onClick={addSearchReplace}>追加</button>
					</td>
					<td>
						<select
							value={searchField.compare}
							onChange={(e) => changeSearchField('compare', e.target.value)}
						>
							<option value="=">完全一致</option>
							<option value="like">あいまい検索</option>
						</select>
						<p>※あいまい検索では「%」をワイルドカードとして使用できます。</p>
					</td>
				</tr>
			</tbody>
		</table>

		<h3>インポートフィールド</h3>
		{
			postTypeFields.map((item) =>
			{
				return (
					<button
						onClick={ () => addImportField(item.name) }
						value={item.name}
					>
						{item.label}
						{item.postTypes.length > 1 && '(' + item.postTypes.length + ')'}
					</button>
				);
			})
		}
		<table className="widefat fixed striped">
			<thead>
				<tr>
					<th>ファイルの〜から</th>
					<th>〜にインポート</th>
					<th>文字の置き換え</th>
					<th>操作</th>
				</tr>
			</thead>
			<tbody>
			{
				importFields.map((item, i) =>
				{
					return <tr>
						<td>
							<select
								onChange={(e) => importFromFieldChange(i, e.target.value) }
								value={item.from}
							>
							<option value=""></option>
							{fromFields.map((item) =>
								{
									return <option value={item}>{item}</option>;
								})
							}
							</select>
						→</td>
						<td>
							<input
								type="text"
								value={item.to}
								onChange={(e) => importToFieldChange(i, e.target.value) }
							/>
							<span>
							{postTypeFields.find(element => item.to == element.name) &&
								postTypeFields.find(element => item.to == element.name).label
							}
							</span>
						</td>
						<td>
							<ul>
							{
								item.replace.map((r_v, r_i) => 
								{
									return (<li>
										<input type="text" value={r_v.from} size="6"
											onChange={ (e) => changeImportFieldReplace(e.target.value, i, r_i, 'from') } />
										→
										<input type="text" value={r_v.to}   size="6"
											onChange={ (e) => changeImportFieldReplace(e.target.value, i, r_i, 'to') } />


										<button onClick={() => removeImportFieldReplace(i, r_i)}>remove</button>
									</li>);
								})
							}
							</ul>
						<button onClick={() => addImportFieldReplace(i)}>追加</button>

						</td>
						<td>
							<button onClick={() => deleteImportField(i)}>remove</button>
						</td>
					</tr>
				})
			}
			</tbody>
		</table>

		{!showRawData && <>
		<h3>インポート</h3>
		<DataTableImport
			api_url={props.api_url}
			data={rawData}
			encoding={encoding}
			postTypes={postTypes}
			postTypeFields={postTypeFields}
			searchField={searchField}
			importFields={importFields}
			importSetting={importSetting}
			changeImportSetting={changeImportSetting}
		/>
		</>}


		{showRawData && <>
		<h3>元データ</h3>
		<DataTableRaw
			data={rawData}
			encoding={encoding}
		/>
		</>}

		<div>
		</div>
	</div>);
}

export default PostImporter;
