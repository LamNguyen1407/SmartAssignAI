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
        formData.append('userID', "6911689f70668d1a11ae9853");
        // formData.append('chatSessionID', "69156a47b300fa095179188f");

        // const res = await axios.post("http://localhost:3001/test", formData);
        const res = await axios.post("http://localhost:3001/chat/semantic-chunk", formData);
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
