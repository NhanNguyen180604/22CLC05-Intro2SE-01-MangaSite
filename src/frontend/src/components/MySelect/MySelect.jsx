import Select from 'react-select';

const MySelect = ({ options, isLoading, value, onChange }) => {
    const myStyles = {
        control: (styles, state) => ({
            ...styles,
            backgroundColor: "var(--darker-navy)",
            border: 'none',
            boxShadow: "none",
            '&:hover': {
                border: 'none',
                outline: '1px solid white',
            },
            outline: state.isFocused ? '1px solid white' : 'none',
            padding: '1rem',
        }),
        input: (styles, state) => ({
            ...styles,
            color: 'white',
        }),
        menu: (styles, state) => ({
            ...styles,
            color: 'white',
            backgroundColor: 'var(--darker-navy)',
        }),
        option: (styles, state) => ({
            ...styles,
            backgroundColor: state.isFocused ? 'var(--medium-navy)' : 'none'
        }),
        multiValue: (styles, state) => ({
            ...styles,
            backgroundColor: 'var(--very-light-blue)',
            borderRadius: '6px',
            gap: '5px'
        }),
        multiValueLabel: (styles, state) => ({
            ...styles,
            color: 'black',
            fontWeight: '600',
        }),
        multiValueRemove: (styles, state) => ({
            ...styles,
            color: 'black',
            ':hover': {
                color: 'var(--red)',
            }
        })
    };

    return (
        <Select
            options={options}
            isMulti
            isLoading={isLoading}
            closeMenuOnSelect={false}
            value={value}
            onChange={onChange}
            styles={myStyles}
        />
    );
};

export default MySelect;