import React, { useState, useRef } from 'react';
import FormField from './FormField';
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const FormBuilder = () => {
    const formRef = useRef(null);
    const [fields, setFields] = useState([]);
    const [errors, setErrors] = useState({});

    const addField = async (type) => {
        if (type === 'checkbox' || type === 'radio') {
            const { value: numberOfOptions } = await Swal.fire({
                title: 'How many options?',
                input: 'number',
                inputLabel: 'Number of options',
                inputValue: 1,
                showCancelButton: true,
                inputValidator: (value) => {
                    if (!value || value <= 0) {
                        return 'Please enter a positive number';
                    }
                }
            });

            if (numberOfOptions) {
                const newField = {
                    id: Date.now(),
                    type,
                    label: '',
                    options: Array(Number(numberOfOptions)).fill({ label: '', subLabel: '' }),
                    validation: {},
                    condition: {}
                };
                setFields([...fields, newField]);
            }
        } else {
            const newField = { id: Date.now(), type, label: '', options: [], validation: {}, condition: {} };
            setFields([...fields, newField]);
        }
    };

    const removeField = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to remove this field?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove it!',
        }).then((result) => {
            if (result.isConfirmed) {
                setFields(fields.filter((field) => field.id !== id));
                toast.success('Field removed successfully!');
            }
        });
    };

    const updateField = (id, updatedField) => {
        setFields(fields.map((field) => (field.id === id ? updatedField : field)));
    };

    const saveForm = () => {
        const formConfig = JSON.stringify(fields);
        localStorage.setItem('formConfig', formConfig);
        toast.success('Form configuration saved successfully!');
    };

    const loadForm = () => {
        const formConfig = localStorage.getItem('formConfig');
        if (formConfig) {
            setFields(JSON.parse(formConfig));
            toast.success('Form configuration loaded successfully!');
        } else {
            toast.error('No saved form configuration found.');
        }
    };

    const validateField = (field) => {
        const validation = field.validation || {};
        const errorMessages = [];

        if (validation.required && !field.label) {
            errorMessages.push('This field is required.');
        }

        if (validation.minLength && field.label.length < validation.minLength) {
            errorMessages.push(`Minimum length is ${validation.minLength}.`);
        }

        return errorMessages;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let hasErrors = false;
        const newErrors = {};

        fields.forEach((field) => {
            const fieldErrors = validateField(field);
            if (fieldErrors.length > 0) {
                hasErrors = true;
                newErrors[field.id] = fieldErrors;
            } else if (errors[field.id]) {
                hasErrors = true;
            }
        });

        setErrors(newErrors);

        if (!hasErrors) {
            toast.success('Form submitted successfully!');
            if (formRef.current) {
                formRef.current.reset();
            }
        }
    };

    const bytesToMb = (bytes) => {
        return bytes / (1024 * 1024);
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        const maxSizeInMB = field.validation?.fileSize || 5;
        const FileSizeUploaded = bytesToMb(file.size);

        if (file && maxSizeInMB && FileSizeUploaded > maxSizeInMB) {
            setErrors({ ...errors, [field.id]: [`File size exceeds the ${maxSizeInMB} MB limit.`] });
            e.target.value = '';
            return;
        } else {
            setErrors({ ...errors, [field.id]: [''] });
        }
    };

    const shouldShowField = (field) => {
        const { dependentField, dependentValue } = field.condition || {};

        if (!dependentField) return true;

        const dependentFieldValue = fields.find((f) => f.id === dependentField)?.label || '';

        return dependentFieldValue === dependentValue;
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Dynamic Form Builder</h2>
            <div className="mb-3">
                <button className="btn btn-primary me-2" onClick={() => addField('text')}>Add Text Input</button>
                <button className="btn btn-primary me-2" onClick={() => addField('textarea')}>Add Text Area</button>
                <button className="btn btn-primary me-2" onClick={() => addField('dropdown')}>Add Dropdown</button>
                <button className="btn btn-primary me-2" onClick={() => addField('checkbox')}>Add Checkbox</button>
                <button className="btn btn-primary me-2" onClick={() => addField('radio')}>Add Radio Button</button>
                <button className="btn btn-primary" onClick={() => addField('file')}>Add Upload Button</button>
            </div>

            <div>
                {fields.map((field) => (
                    shouldShowField(field) && (
                        <div key={field.id} className="mb-3">
                            <FormField
                                field={field}
                                onRemove={() => removeField(field.id)}
                                onUpdate={(updatedField) => updateField(field.id, updatedField)}
                            />
                            {errors[field.id] && (
                                <div className="text-danger">
                                    {errors[field.id].map((error, index) => (
                                        <div key={index}>{error}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                ))}
            </div>

            <div className="mt-4">
                <button className="btn btn-success me-2" onClick={saveForm}>Save Form Configuration</button>
                <button className="btn btn-warning" onClick={loadForm}>Load Form Configuration</button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5" ref={formRef}>
                <h3>Form Preview</h3>
                {fields.map((field) => (
                    shouldShowField(field) && (
                        <div key={field.id} className="mb-3">
                            <label className={`form-label ${field.validation?.required ? 'required' : ''}`}>
                                {field.label}
                                {field.validation?.required && <span className="text-danger"> *</span>}
                            </label>
                            {field.type === 'text' && (
                                <input
                                    type={field.validation?.inputType || 'text'}
                                    className="form-control"
                                    required={field.validation?.required || false}
                                    pattern={field.validation?.pattern || ''}
                                    placeholder={field.validation?.type === 'phone' ? 'Enter your phone number' : 'Enter your text'}
                                />
                            )}
                            {field.type === 'file' && (
                                <input
                                    type={field.validation?.inputType || 'file'}
                                    className="form-control"
                                    required={field.validation?.required || false}
                                    accept={field.validation?.accept || ''}
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            handleFileChange(e, field);
                                        }
                                    }}
                                />
                            )}
                            {field.type === 'textarea' && (
                                <textarea
                                    className="form-control"
                                    required={field.validation?.required || false}
                                    placeholder={field.validation?.type === 'phone' ? 'Enter your phone number' : 'Enter your text'}
                                    pattern={field.validation?.pattern || ''}
                                />
                            )}
                            {field.type === 'dropdown' && (
                                <select className="form-select" required={field.validation?.required || false}>
                                    <option value="">Select an option</option>
                                    {field.options.map((option, index) => (
                                        <option key={index} value={option.label}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {field.type === 'checkbox' && (
                                <div className='horizontal-options'>
                                    {field.options.map((option, index) => (
                                        <div key={index} className="form-check">
                                            <input type="checkbox" className="form-check-input" id={`checkbox-${index}`} />
                                            <label className="form-check-label" htmlFor={`checkbox-${index}`}>
                                                {option.label} - {option.subLabel}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {field.type === 'radio' && (
                                <div className='horizontal-options'>
                                    {field.options.map((option, index) => (
                                        <div key={index} className="form-check">
                                            <input type="radio" className="form-check-input" id={`radio-${index}`} name={`radio-group-${field.id}`} />
                                            <label className="form-check-label" htmlFor={`radio-${index}`}>
                                                {option.label} - {option.subLabel}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                ))}
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>

            <ToastContainer />
        </div>
    );
};

export default FormBuilder;
