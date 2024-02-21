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
    const div = document.getElementsByClassName("pagination");
    let url = name ? `/api/companies?page=${page}&perPage=${perPage}&name=${name}` : `/api/companies?page=${page}&perPage=${perPage}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {    
            let companyRows = data.map(company => companyObjectToTableRowTemplate(company)).join('');
            document.querySelector('#companyTable tbody').innerHTML = companyRows;
            document.querySelector('#current-page').textContent = page;

            document.querySelectorAll('#companyTable tbody tr').forEach(row => {
                row.addEventListener("click", e => {
                    let clickedId = row.getAttribute("data-id");

                    fetch(`/api/company/${clickedId}`)
                        .then(res => res.json())
                        .then(data => {
                            let singleCompanyInfo = `
                                <strong>Category:</strong> ${data.category_code || ''}<br /><br />
                                <strong>Description:</strong> ${data.description || ''}<br /><br />
                                <strong>Overview:</strong> ${data.overview || ''}<br /><br />
                                <strong>Tag List:</strong> ${data.tag_list || ''}<br />
                                <strong>Founded:</strong> ${data.founded_year ? `${data.founded_month || ''}/${data.founded_day || ''}/${data.founded_year}` : ''}<br /><br />
                                <strong>CEOs:</strong> ${data.relationships.filter(relationed => relationed.title.includes("CEO")).map(relationed => `${relationed.person.first_name} ${relationed.person.last_name} (${relationed.title})`).join(', ') || 'No persons listed. Information needed!'}<br /><br />
                                <strong>Products:</strong> ${data.products.map(product => product.name).join(', ') || 'This company has made no products.'}<br /><br />
                                <strong>Number of Employees:</strong> ${data.number_of_employees || ''}<br /><br />
                                <strong>Website:</strong> ${data.homepage_url || ''}<br /><br />
                            `;

                            document.querySelector("#detailsModal .modal-body").innerHTML = singleCompanyInfo;

                            let modal = new bootstrap.Modal(document.getElementById("detailsModal"), {
                                backdrop: "static",
                                keyboard: false
                            });

                            modal.show();
                        });
                });
            });
        })
        .catch(error => {
            console.error('Error loading company data:', error);
        });
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