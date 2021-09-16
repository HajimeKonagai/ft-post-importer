import React from 'react';
import ReactDOM from 'react-dom';
import { useState } from 'react'

import Encoding from 'encoding-japanese'

import RawData from './Data'

const PostImporter = () =>
{
	const defaultConfig = {
		a: 1,
		b: 2,
		column: [
			{},
			{},
			{},
		],
	};



	const setConfig()
	{
		
	}

	/*
	const defaultConfig = {
		a: 1,
		b: 2,
		column: [
			{},
			{},
			{},
		],
	};
	const [config, setConfig] = useState({ ...defaultConfig, ...props.config });

	const [data, setData] = useState([]);
	*/

	// config は処理ごとに

	const [data, setData] = useState([]);

	const [count, setCount] = useState(0);

	const increment = () =>
	{
		setCount((prevCount) => { return prevCount + 1});
	}



	const [fileEncode, setFileEncode] = useState('SJIS');
	useEffect(() =>
	{
		newData = data.map((line) =>
		{
			return line.map.((cell) =>
			{
				return convert(cell);
			});
		});
		for (let i = 0; i < data.length; i++)
		{
			
		}
	}, [fileEncode]);

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
			const csvArr = csvArray(result);

			let colsNum = 0;
			for (let i =0; i < csvArr.length; i++)
			{
				colsNum = Math.max(csvArr[i].length, colsNum);
			}

			console.log(csvArr);

			setData(csvArr)
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

	const addImportColumn = () =>
	{
	/*
		console.log('hgoe');
		let _new = { ...config };
		// let _new = config.column.slice();
		_new.column.push({
				from: 0,
				to: 0,
			});
		setConfig(_new);
	*/
		/*(prev) => {
			console.log('hgsssssoe');

			console.log(prev);

			return prev;
		});
		*/
	}


	const encode = (val) =>
	{
		return Encoding.convert(val, {to: 'UNICODE', from: 'SJIS'})
	}

	return (
		<div>
			<label>ファイル
				<input type="file" onChange={FileRead} />
			</label>

			{ /* csv - ファイルのエンコード */ }
			{ /* JSON - インポート先の post type */ }
			{ /* JSON - 更新記事の検索対象フィールド(全部新規の場合はなしに) */ }
			{ /* JSON - 検索時にワイルドカード(%)を使用するか */ }

			{ /* JSON - 可変 フィールドの追加ボタン */ }
			{ /* JSON - [可変] インポート先のフィールド */ }
			{ /* JSON - [可変] インポート元のカラム */ }
			{ /* JSON - [可変] 文字の置き換え */ }
			{ /*  */ }

			{ /* インポート Dry run ボタン */ }
			{ /* インポート Live run ボタン */ }

			{ /*config.column.map((item) => {
				return (<>
					<input type="text" value={item.from} />
					<input type="text" value={item.from} />
					<input type="text" value={item.from} />
					</>
					
				);
			}) */}

			<button onClick={addImportColumn}>設定を追加</button>
			douda
			<button onClick={increment}>{count}</button>



			<RawData
				data={data}
				encode={encode}
			/>

		</div>
	);
}

export default PostImporter;
