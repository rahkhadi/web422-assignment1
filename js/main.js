var page = 1;
const perPage = 8;

let companyObjectToTableRowTemplate = company => {
    let officeInfo = company.offices.length > 0 ? `${company.offices[0].city}, ${company.offices[0].state_code}, ${company.offices[0].country_code}` : `<b>--</b>`;
    let foundedDate = company.founded_year ? `${company.founded_month || ''}/${company.founded_day || ''}/${company.founded_year}` : `<b>--</b>`;
    let tags = company.tag_list ? company.tag_list.split(', ').slice(0, 2).join(', ') : `<b>--</b>`;
    
    return `
    <tr data-id="${company._id}">
        <td>${company.name}</td>
        <td>${company.description || `<b>--</b>`}</td>
        <td>${company.number_of_employees || `<b>--</b>`}</td>
        <td>${officeInfo}</td>
        <td>${company.category_code || `<b>--</b>`}</td>
        <td>${foundedDate}</td>
        <td><a href="${company.homepage_url}" target="_blank">${company.homepage_url}</a></td>
        <td>${tags}</td>
    </tr>`;
};

function loadCompanyData(name = null) {
    let url = name ? `/api/companies?page=${page}&perPage=${perPage}&name=${name}` 
                   : `/api/companies?page=${page}&perPage=${perPage}`;

    fetch(url)
    .then(response => response.json())
    .then(companies => {
        const tableBody = document.querySelector('#companyTable tbody');
        tableBody.innerHTML = companies.map(company => companyObjectToTableRowTemplate(company)).join('');

        document.querySelector('#current-page').innerText = page;

        document.querySelectorAll('#companyTable tbody tr').forEach(row => {
            row.addEventListener('click', () => {
                const clickedId = row.getAttribute('data-id');
                fetch(`/api/company/${clickedId}`)
                .then(response => response.json())
                .then(data => {
                    const modalBody = document.querySelector('#detailsModal .modal-body');
                    modalBody.innerHTML = generateCompanyDetailsHTML(data);
                    new bootstrap.Modal(document.getElementById('detailsModal')).show();
                })
                .catch(error => console.error('Error fetching company details:', error));
            });
        });
    })
    .catch(error => console.error('Error loading company data:', error));
}

document.addEventListener('DOMContentLoaded', function () {
    
    loadCompanyData();

    document.querySelector("#previous-page").addEventListener('click', event => {
        if (page > 1) {
            page -= 1;
            loadCompanyData();
        }
    });

    document.querySelector("#next-page").addEventListener('click', event => {
        page += 1;
        loadCompanyData();
    });

    document.querySelector("#searchForm").addEventListener('submit', event => {
        // prevent the form from from 'officially' submitting
        event.preventDefault();
        // populate the posts table with the pageSel value
        loadCompanyData(document.querySelector("#name").value);
    });

    document.querySelector("#clearForm").addEventListener('click', event => {
        document.querySelector("#name").value = ``;
        loadCompanyData();
    });
    
});