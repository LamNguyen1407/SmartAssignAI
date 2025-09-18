"use client";

import { Form, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

export default function ProfilePage() {
    const [form] = Form.useForm();
    const handleSubmit = async () => {
        const values = form.getFieldsValue();
        const formData = new FormData();
        formData.append('file', values.file[0].originFileObj);
        const res = await axios.post("http://localhost:3001/upload", formData);
        console.log("res ", res);
    }

    return (
        <Form
            form={form}
            layout="vertical"
        >
            <Form.Item
                label="Upload File"
                name="file"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            >
                <Upload beforeUpload={() => false}>
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
            </Form.Item>

            <Button type="primary" htmlType="submit" onClick={handleSubmit}>
                Submit
            </Button>
        </Form>
    );
}
