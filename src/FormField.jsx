import React from 'react';
import { Button, Form, Col, Row } from 'react-bootstrap';
import './FormField.css';

const FormField = ({ field, onRemove, onUpdate }) => {
    const handleLabelChange = (e) => {
        onUpdate({ ...field, label: e.target.value });
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...field.options];
        newOptions[index] = { ...newOptions[index], label: value };
        onUpdate({ ...field, options: newOptions });
    };

    const handleSubLabelChange = (index, value) => {
        const newOptions = [...field.options];
        newOptions[index] = { ...newOptions[index], subLabel: value };
        onUpdate({ ...field, options: newOptions });
    };

    const addOption = () => {
        onUpdate({ ...field, options: [...field.options, { label: '', subLabel: '' }] });
    };

    const removeOption = (index) => {
        const newOptions = field.options.filter((_, i) => i !== index);
        onUpdate({ ...field, options: newOptions });
    };

    const handleValidationChange = (e) => {
        const { name, value, type, checked } = e.target;
        const validationValue = type === 'checkbox' ? checked : value;
        onUpdate({ ...field, validation: { ...field.validation, [name]: validationValue } });
    };

    const handleMinLengthChange = (e) => {
        onUpdate({ ...field, validation: { ...field.validation, minLength: e.target.value } });
    };

    const handleMaxLengthChange = (e) => {
        onUpdate({ ...field, validation: { ...field.validation, maxLength: e.target.value } });
    };

    const handleValidationTypeChange = (e) => {
        const validationType = e.target.value;
        let min = field.validation?.minLength;
        let max = field.validation?.maxLength;
        let inputType = "text";
        let pattern = `\\d{${min},${max}}`;
        let accept = "";

        if (validationType === "email") {
            inputType = "email";
        } else if (validationType === "phone") {
            inputType = "tel";
            pattern = "^(9|8|6|7)\d{9}$";
        } else if (validationType === "number") {
            inputType = "text";
        }

        onUpdate({ ...field, validation: { ...field.validation, type: validationType, inputType, pattern, accept } });
    };

    const handleFileTypeChange = (e) => {
        const fileType = e.target.value;
        let acceptType = '';

        if (fileType === 'pdf') {
            acceptType = 'application/pdf';
        } else if (['jpg', 'jpeg', 'png'].includes(fileType)) {
            acceptType = `image/${fileType}`;
        }

        onUpdate({ ...field, validation: { ...field.validation, fileType: fileType, accept: acceptType } });
    };

    const handleFileSizeChange = (e) => {
        onUpdate({ ...field, validation: { ...field.validation, fileSize: e.target.value } });
    };

    return (
        <div className="form-field mb-3 p-3 border rounded">
            <Row className="mb-2">
                <Col md={10}>
                    <Form.Group>
                        <Form.Label>Label</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter field label"
                            value={field.label}
                            onChange={handleLabelChange}
                        />
                    </Form.Group>
                </Col>
                <Col md={2} className="text-end">
                    <Button variant="danger" onClick={onRemove}>Remove</Button>
                </Col>
            </Row>

            <Form.Group className="mb-2">
                <Form.Check
                    type="checkbox"
                    label="Required"
                    name="required"
                    checked={field.validation?.required || false}
                    onChange={handleValidationChange}
                />
            </Form.Group>
            {['text', 'textarea'].includes(field.type) && (
                <div>
                    <Form.Group className="mb-2">
                        <Form.Label>Min Length</Form.Label>
                        <Form.Control
                            type="number"
                            value={field.validation?.minLength || ''}
                            onChange={handleMinLengthChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Max Length</Form.Label>
                        <Form.Control
                            type="number"
                            value={field.validation?.maxLength || ''}
                            onChange={handleMaxLengthChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Validation Type</Form.Label>
                        <Form.Select value={field.validation?.type || ''} onChange={handleValidationTypeChange}>
                            <option value="">None</option>
                            <option value="number">Numbers</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone Number</option>
                        </Form.Select>
                    </Form.Group>
                </div>
            )}

            {field.type === 'file' && (
                <div>
                    <Form.Group className="mb-2">
                        <Form.Label>Allowed File Type</Form.Label>
                        <Form.Select value={field.validation?.fileType || ''} onChange={handleFileTypeChange}>
                            <option value="">Select File Type</option>
                            <option value="pdf">PDF</option>
                            <option value="jpeg">JPEG</option>
                            <option value="png">PNG</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Max File Size (MB)</Form.Label>
                        <Form.Control
                            type="tel"
                            value={field.validation?.fileSize || ''}
                            onChange={handleFileSizeChange}
                            placeholder='By default the max file size is 5MB'
                        />
                    </Form.Group>
                </div>
            )}
            {field.type === 'dropdown' && (
                <Form.Group className="mb-2">
                    <Form.Label>Dropdown</Form.Label>
                    <Form.Select required={field.validation?.required}>
                        <option value="">Select an option</option>
                        {field.options.map((option, index) => (
                            <option key={index} value={option.label}>
                                {option.label}
                            </option>
                        ))}
                    </Form.Select>
                    <div className="mt-2">
                        {field.options.map((option, index) => (
                            <Row key={index} className="align-items-center mb-2">
                                <Col md={5}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Option label"
                                        value={option.label}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                    />
                                </Col>
                                <Col md={2}>
                                    <Button variant="danger" onClick={() => removeOption(index)}>Remove</Button>
                                </Col>
                            </Row>
                        ))}
                        <Button variant="primary" onClick={addOption}>Add Option</Button>
                    </div>
                </Form.Group>
            )}

            {field.type === 'checkbox' && (
                <Form.Group className="mb-2">
                    <div className="mt-2">
                        {field.options.map((option, index) => (
                            <div key={index} className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`checkbox-${index}`}
                                />
                                <label className="form-check-label" htmlFor={`checkbox-${index}`}>
                                    {option.label} - {option.subLabel}
                                </label>
                                <Form.Control
                                    type="text"
                                    placeholder="Sub-label"
                                    value={option.subLabel}
                                    onChange={(e) => handleSubLabelChange(index, e.target.value)}
                                />
                                <Button variant="danger" onClick={() => removeOption(index)}>Remove</Button>
                            </div>
                        ))}
                        <Button variant="primary" onClick={addOption}>Add Checkbox Option</Button>
                    </div>
                </Form.Group>
            )}

            {field.type === 'radio' && (
                <Form.Group className="mb-2">
                    <div className="mt-2">
                        {field.options.map((option, index) => (
                            <div key={index} className="form-check">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    id={`radio-${index}`}
                                    name={`radio-group-${field.id}`}
                                />
                                <label className="form-check-label" htmlFor={`radio-${index}`}>
                                    {option.label} - {option.subLabel}
                                </label>
                                <Form.Control
                                    type="text"
                                    placeholder="Sub-label"
                                    value={option.subLabel}
                                    onChange={(e) => handleSubLabelChange(index, e.target.value)}
                                />
                                <Button variant="danger" onClick={() => removeOption(index)}>Remove</Button>
                            </div>
                        ))}
                        <Button variant="primary" onClick={addOption}>Add Radio Option</Button>
                    </div>
                </Form.Group>
            )}
        </div>
    );
};

export default FormField;
