import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createTicket, reset } from "../features/tickets/ticketSlice";
import { fetchAllUsers } from "../features/auth/authSlice";
import Spinner from "../components/Spinner";
import BackButton from "../components/BackButton";
import SendIcon from "@mui/icons-material/Send";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  Button,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Alert,
  IconButton,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import CloseIcon from "@mui/icons-material/Close";
import { getAllOrganization } from "../features/organization/organizationSlice";
import { getAllIssueTypes } from "../features/issues/issueSlice";
import axios from "axios";
import { getAllProject } from "../features/project/projectSlice";

function NewTicket() {
  const { user } = useSelector((state) => state.auth);
  const { isLoading, isError, message, isSuccess } = useSelector(
    (state) => state.tickets
  );

  const users = useSelector((state) => state.auth.users);
  const issues = useSelector((state) => state.issueTypes.issueTypes);
  const projects = useSelector((state) => state.project.project);
  const organizations = useSelector(
    (state) => state.organizations.organizations
  );

  const [title, setTitle] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [customerContact, setCustomerContact] = useState("");
  const [product, setProduct] = useState("");
  const [priority, setPriority] = useState("");
  const [issueType, setIssueType] = useState("");
  const [project, setProject] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  //const [media, setMedia] = useState([]);
  const [organization, setOrganization] = useState("");
  const [showAlert, setShowAlert] = useState(false); // For empty form alert
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAllUsers());
    dispatch(getAllOrganization());
    dispatch(getAllIssueTypes());
    dispatch(getAllProject());
  }, [dispatch]);

  const handleFileChange = (e) => {
    const files = e.target.files;
    // Ensure that files is converted to an array, even if it's a FileList
    const filesArray = Array.from(files);
    setMedia(filesArray);
  };

  {
    /*
  const handleMedia = (e) => {
    const selectedMedia = e.target.files;
    const mediaArray = [];

    for (let i = 0; i < selectedMedia.length; i++) {
      const file = selectedMedia[i];
      setFileToBase(file, (base64Media) => {
        mediaArray.push(base64Media);

        if (i === selectedMedia.length - 1) {
          setMedia(mediaArray);
        }
      });
    }
  };
*/
  }
  useEffect(() => {
    loadDraftFromLocalStorage();
  }, []);
  const setFileToBase = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64Media = reader.result;
      callback(base64Media);
    };
  };
  /*
  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    if (isSuccess) {
      dispatch(reset());
      navigate("/ticketss");
      toast.success("New ticket created!");
    }
  }, [dispatch, isError, isSuccess, navigate, message, reset]);
*/
  const saveDraftToLocalStorage = () => {
    const draftData = {
      title,
      customerName,
      customerEmail,
      isEmailValid,
      customerContact,
      project,
      priority,
      issueType,
      description,
      assignedTo,
      //media,
      organization,
    };

    // Save the draft data to local storage
    localStorage.setItem("ticketDraft", JSON.stringify(draftData));
  };

  const loadDraftFromLocalStorage = () => {
    // Load the draft data from local storage
    const storedDraft = localStorage.getItem("ticketDraft");

    if (storedDraft) {
      const draftData = JSON.parse(storedDraft);

      // Set the form fields with the loaded draft data
      setTitle(draftData.title || "");
      setCustomerName(draftData.customerName || "");
      setCustomerEmail(draftData.customerEmail || "");
      setIsEmailValid(draftData.isEmailValid || false);
      setCustomerContact(draftData.customerContact || "");
      setProject(draftData.project || "");
      setPriority(draftData.priority || "");
      setIssueType(draftData.issueType || "");
      setDescription(draftData.description || "");
      setAssignedTo(draftData.assignedTo || "");
      // setMedia(draftData.media || []);
      setOrganization(draftData.organization || "");
    }
  };

  useEffect(() => {
    // Load the draft data when the component mounts
    loadDraftFromLocalStorage();
  }, []);

  const handleInputChange = (e) => {
    // Update the state and save the draft to local storage when the input changes
    const { name, value, files } = e.target;
    if (name) {
      switch (name) {
        case "title":
          setTitle(value);
          break;
        case "customerName":
          setCustomerName(value);
          break;
        case "customerEmail":
          setCustomerEmail(value);
          break;
        case "customerContact":
          setCustomerContact(value);
          break;
        case "project":
          setProject(value);
          break;
        case "priority":
          setPriority(value);
          break;
        case "issueType":
          setIssueType(value);
          break;
        case "description":
          setDescription(value);
          break;
        case "assignedTo":
          setAssignedTo(value);
          break;
        case "organization":
          setOrganization(value);
          break;
        /*
          case "media":
            if (files) {
              // Only call handleMedia when files are present
              handleMedia(files);
            }
            break;
          */
        default:
          break;
      }

      // Save the draft to local storage
      saveDraftToLocalStorage();
    }
  };

  useEffect(() => {
    // Filter users based on the selected organization initially
    if (organization) {
      const selectedOrganizationId = organization;
      setFilteredUsers(
        users.filter((user) => user.organization === selectedOrganizationId)
      );
    }
  }, [organization, users]);

  const onSubmit = async (e, status) => {
    e.preventDefault();

    const ticketData = {
      project,
      //media,
      description,
      priority,
      assignedTo,
      issueType,
      customerName,
      customerEmail,
      customerContact,
      organization,
      title,
      status: status === "draft" ? "draft" : "new",
    };
    try {
      // Create the ticket and get the response
      const response = await dispatch(createTicket(ticketData));

      // Extract ticket ID from the API response
      const newTicketID = response.payload._id;

      // If media files are present, upload them
      if (media.length > 0) {
        setUploading(true);

        const formData = new FormData();
        media.forEach((file) => {
          formData.append("media", file);
        });

        // Append ticket ID to the media upload data
        formData.append("ticketID", newTicketID);

        // Send a request to the media upload endpoint (http://localhost:5000/upload)
        const mediaResponse = await axios.post(
          "http://localhost:5000/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              console.log(progress);
              setUploadProgress(progress);
            },
          }
        );

        // Handle the media upload response as needed
        //const mediaUploadData = await mediaResponse.json();
        // console.log("Media upload response:", mediaUploadData);
      }

      // Reset form, navigate to tickets page, and show success toast
      dispatch(reset());
      navigate("/ticketss");
      toast.success("New ticket created!");
      localStorage.removeItem("ticketDraft");
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Error creating new ticket");
    } finally {
    }
    setUploading(false);
    setUploadProgress(0);
  };
  const userRole = useSelector((state) => state.auth.user?.role);

  // Define an array of roles that should see the "Dashboard" link
  const allowedRoles = ["ADMIN", "SUPERVISOR"];

  const allowedRolesReview = ["ADMIN", "SUPERVISOR", "ORGAGENT"];

  if (isLoading) return <Spinner />;
  if (uploading) return <Spinner uploadProgress={uploadProgress} />;

  return (
    <>
      <BackButton url="/" />
      <section className="flex items-center justify-center ">
        <div>
          <Typography variant="h4" component="h1" gutterBottom>
            Create New Ticket
          </Typography>
          <Typography variant="body2">
            Please fill out the form below
          </Typography>
        </div>
      </section>

      <form onSubmit={onSubmit} className="p-6">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label=" Ticket title"
              placeholder="Ticket title"
              name="title"
              value={title}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Customer Name"
              name="customerName"
              placeholder="Customer Name"
              value={customerName}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Customer Email"
              name="customerEmail"
              placeholder="Customer Email"
              value={customerEmail}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Customer Contact"
              name="customerContact"
              placeholder="Customer Contact"
              value={customerContact}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="organization">Organization</InputLabel>
              <Select
                name="organization"
                id="organization"
                value={organization}
                onChange={handleInputChange}
              >
                <MenuItem value="">Select One</MenuItem>
                {user &&
                user.organization &&
                organizations &&
                organizations.length > 0 ? (
                  organizations
                    .filter((org) => org._id === user.organization)
                    .map((organization) => (
                      <MenuItem key={organization._id} value={organization._id}>
                        {organization.name}
                      </MenuItem>
                    ))
                ) : (
                  <MenuItem value="" disabled>
                    No organization available
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          {userRole && allowedRoles.includes(userRole) && (
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel htmlFor="assignedTo">Assign To</InputLabel>
                <Select
                  name="assignedTo"
                  id="assignedTo"
                  value={assignedTo}
                  onChange={handleInputChange}
                >
                  <MenuItem value="">Select One</MenuItem>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>
                      No users available for the selected organization
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="project">Project</InputLabel>
              <Select
                name="project"
                id="project"
                value={project}
                onChange={handleInputChange}
              >
                <MenuItem value="">Select One</MenuItem>
                {projects && projects.length > 0 ? (
                  projects.map((project) => (
                    <MenuItem key={project._id} value={project._id}>
                      {project.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    No project available
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          {userRole && allowedRoles.includes(userRole) && (
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel htmlFor="priority">Priority</InputLabel>
                <Select
                  name="priority"
                  id="priority"
                  value={priority}
                  onChange={handleInputChange}
                >
                  <MenuItem value="">Select One</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="issueType">Issue Type</InputLabel>
              <Select
                name="issueType"
                id="issueType"
                value={issueType}
                onChange={handleInputChange}
              >
                <MenuItem value="">Select One</MenuItem>
                {issues && issues.length > 0 ? (
                  issues.map((issue) => (
                    <MenuItem key={issue._id} value={issue._id}>
                      {issue.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    No issue available
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description of the issue"
              name="description"
              placeholder="Description"
              value={description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={4}
            />
          </Grid>
          <Grid item xs={12}>
            <input
              type="file"
              id="media"
              name="media"
              multiple
              onChange={handleFileChange}
            />
          </Grid>
          {/*
{uploading && (
    <div>
      <Spinner uploadProgress={uploadProgress} />
      <span>{uploadProgress}% Uploading media</span>
    </div>
  )}
*/}
          {/*
          <Grid item xs={12}>
            <div className="form-outline mb-4">
              <label
                htmlFor="formupload"
                className="bg-yellow-500 text-white py-2 px-4 rounded cursor-pointer hover:bg-yellow-700"
              >
                Upload Media (Images and Videos)
                <input
                  onChange={handleMedia}
                  type="file"
                  id="formupload"
                  name="media"
                  className="hidden"
                  accept="image/*, video/*"
                  multiple
                />
              </label>
            </div>
            {media.length > 0 && (
              <div className="selected-media">
                <Typography variant="body2" gutterBottom>
                  Selected Media:
                </Typography>
                <div className="media-items-container">
                  {media.map((mediaItem, index) => (
                    <div key={index} className="media-item">
                      {mediaItem.startsWith("data:image") ? (
                        <img
                          className="img-preview max-w-full max-h-32" // Adjust the max height as needed
                          src={mediaItem}
                          alt={`Selected Image ${index + 1}`}
                        />
                      ) : (
                        <video
                          controls
                          className="video-preview max-w-full max-h-32" // Adjust the max height as needed
                          src={mediaItem}
                          alt={`Selected Video ${index + 1}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Grid>
          */}
          {/*
          <Grid item xs={12}>
            <div className="form-outline mb-4">
              <input
                onChange={handleInputChange}
                type="file"
                id="formupload"
                name="media"
                className="form-control"
                accept="image/*, video/*"
                multiple
              />
              <label className="form-label" htmlFor="formupload">
                Upload Media (Images and Videos)
              </label>
            </div>
            {media.length > 0 && (
              <div className="selected-media">
                <Typography variant="body2" gutterBottom>
                  Selected Media:
                </Typography>
                <div className="media-items-container">
                  {media.map((mediaItem, index) => (
                    <div key={index} className="media-item">
                      {mediaItem.startsWith("data:image") ? (
                        <img
                          className="img-preview max-w-full max-h-32"
                          src={mediaItem}
                          alt={`Selected Image ${index + 1}`}
                        />
                      ) : (
                        <video
                          controls
                          className="video-preview max-w-full max-h-32"
                          src={mediaItem}
                          alt={`Selected Video ${index + 1}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Grid>
                      */}
        </Grid>
        <div className="form-group mt-6 space-x-6">
          <Button
            variant="contained"
            color="success"
            endIcon={<SendIcon />}
            onClick={(e) => onSubmit(e, "new")}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Submit as New"}
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={(e) => onSubmit(e, "draft")}
          >
            Save as Draft
          </Button>
        </div>
      </form>
    </>
  );
}

export default NewTicket; /*

/*
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createTicket, reset } from "../features/tickets/ticketSlice";
import { fetchAllUsers } from "../features/auth/authSlice";
import Spinner from "../components/Spinner";
import BackButton from "../components/BackButton";
import {
  Button,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Alert,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import CloseIcon from "@mui/icons-material/Close";
import { getAllOrganization } from "../features/organization/organizationSlice";
import { getAllIssueTypes } from "../features/issues/issueSlice";

function NewTicket() {
  const { user } = useSelector((state) => state.auth);
  const { isLoading, isError,  message, isSuccess } = useSelector(
    (state) => state.tickets
  );
 
  const users = useSelector((state) => state.auth.users);
  const issues = useSelector((state) => state.issueTypes.issueTypes);
  const organizations = useSelector((state) => state.organizations.organizations);

  const [title, setTitle] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [customerContact, setCustomerContact] = useState("");
  const [product, setProduct] = useState("");
  const [priority, setPriority] = useState("");
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [media, setMedia] = useState([]);
  const [organization, setOrganization] = useState("");
  const [showAlert, setShowAlert] = useState(false); // For empty form alert
  const [filteredUsers, setFilteredUsers] = useState([]);


  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAllUsers());
    dispatch(getAllOrganization());
    dispatch(getAllIssueTypes());
  }, [dispatch]);

  const handleMedia = (e) => {
    const selectedMedia = e.target.files;
    const mediaArray = [];

    for (let i = 0; i < selectedMedia.length; i++) {
      const file = selectedMedia[i];
      setFileToBase(file, (base64Media) => {
        mediaArray.push(base64Media);

        if (i === selectedMedia.length - 1) {
          setMedia(mediaArray);
        }
      });
    }
  };
  useEffect(() => {
    
    loadDraftFromLocalStorage();
  }, []);
  const setFileToBase = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64Media = reader.result;
      callback(base64Media);
    };
  };
  
  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    if (isSuccess) {
      dispatch(reset());
      navigate('/ticketss');
      toast.success('New ticket created!');
      
    }
    
  }, [dispatch, isError, isSuccess, navigate, message, reset]);
  

  const saveDraftToLocalStorage = () => {
    const draftData = {
      title,
      customerName,
      customerEmail,
      isEmailValid,
      customerContact,
      product,
      priority,
      issueType,
      description,
      assignedTo,
      media,
      organization,
    };

    // Save the draft data to local storage
    localStorage.setItem("ticketDraft", JSON.stringify(draftData));
  };

  const loadDraftFromLocalStorage = () => {
    // Load the draft data from local storage
    const storedDraft = localStorage.getItem("ticketDraft");

    if (storedDraft) {
      const draftData = JSON.parse(storedDraft);

      // Set the form fields with the loaded draft data
      setTitle(draftData.title || "");
      setCustomerName(draftData.customerName || "");
      setCustomerEmail(draftData.customerEmail || "");
      setIsEmailValid(draftData.isEmailValid || false);
      setCustomerContact(draftData.customerContact || "");
      setProduct(draftData.product || "");
      setPriority(draftData.priority || "");
      setIssueType(draftData.issueType || "");
      setDescription(draftData.description || "");
      setAssignedTo(draftData.assignedTo || "");
      setMedia(draftData.media || []);
      setOrganization(draftData.organization || "");
    }
  };

  useEffect(() => {
    // Load the draft data when the component mounts
    loadDraftFromLocalStorage();

   
    
  }, []);

  const handleInputChange = (e) => {
    // Update the state and save the draft to local storage when the input changes
    const { name, value, files } = e.target;
    if (name) {
      switch (name) {
        case "title":
          setTitle(value);
          break;
        case "customerName":
          setCustomerName(value);
          break;
        case "customerEmail":
          setCustomerEmail(value);
          break;
        case "customerContact":
          setCustomerContact(value);
          break;
        case "product":
          setProduct(value);
          break;
        case "priority":
          setPriority(value);
          break;
        case "issueType":
          setIssueType(value);
          break;
        case "description":
          setDescription(value);
          break;
        case "assignedTo":
          setAssignedTo(value);
          break;
          case "organization":
          setOrganization(value);
          break;
          /*
          case "media":
            if (files) {
              // Only call handleMedia when files are present
              handleMedia(files);
            }
            break;
          *
        default:
          break;

       
      }

      // Save the draft to local storage
      saveDraftToLocalStorage();
    }
  };

  useEffect(() => {
    // Filter users based on the selected organization initially
    if (organization) {
      const selectedOrganizationId = organization;
      setFilteredUsers(
        users.filter((user) => user.organization === selectedOrganizationId)
      );
    }
  }, [organization, users]);

  const onSubmit = (e) => {
    e.preventDefault();
   

    const ticketData = {
      product,
      media,
      description,
      priority,
      assignedTo,
      issueType,
      customerName,
      customerEmail,
      customerContact,
      organization,
      title
    };
    console.log(ticketData)
    dispatch(createTicket(ticketData));
    localStorage.removeItem("ticketDraft");
  };
  const userRole = useSelector((state) => state.auth.user?.role);

  // Define an array of roles that should see the "Dashboard" link
  const allowedRoles = ["ADMIN", "SUPERVISOR"];

  const allowedRolesReview = ["ADMIN", "SUPERVISOR","ORGAGENT"];

  if (isLoading) return <Spinner />;

  return (
    <>
      <BackButton url="/" />
      <section className="flex items-center justify-center ">
    
          <div>
            <Typography variant="h4" component="h1" gutterBottom>
              Create New Ticket
            </Typography>
            <Typography variant="body2">
              Please fill out the form below
            </Typography>
          </div>
         
        
      </section>

      <form onSubmit={onSubmit} className="p-6">


        <Grid container spacing={3}>
        <Grid item xs={12}>
            <TextField
              label=" Ticket title"
              placeholder="Ticket title"
              name="title"
              value={title}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
            label="Customer Name"
              name="customerName"
              placeholder="Customer Name"
              value={customerName}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
            label="Customer Email"
              name="customerEmail"
              placeholder="Customer Email"
              value={customerEmail}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
             label="Customer Contact"
              name="customerContact"
              placeholder="Customer Contact"
              value={customerContact}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
          <FormControl fullWidth>
  <InputLabel htmlFor="organization">Organization</InputLabel>
  <Select
    name="organization"
    id="organization"
    value={organization}
    onChange={handleInputChange}
  >
    <MenuItem value="">
      Select One
    </MenuItem>
    {user && user.organization && organizations && organizations.length > 0 ? (
      organizations
        .filter((org) => org._id === user.organization)
        .map((organization) => (
          <MenuItem key={organization._id} value={organization._id}>
            {organization.name}
          </MenuItem>
        ))
    ) : (
      <MenuItem value="" disabled>
        No organization available
      </MenuItem>
    )}
  </Select>
</FormControl>
          </Grid>

          {
          userRole &&
          allowedRoles.includes(userRole) && 
        
          <Grid item xs={6}>
  <FormControl fullWidth>
    <InputLabel htmlFor="assignedTo">Assign To</InputLabel>
    <Select
      name="assignedTo"
      id="assignedTo"
      value={assignedTo}
      onChange={handleInputChange}
    >
      <MenuItem value="">
        Select One
      </MenuItem>
      {filteredUsers.length > 0 ? (
        filteredUsers.map((user) => (
          <MenuItem key={user._id} value={user._id}>
            {user.name}
          </MenuItem>
        ))
      ) : (
        <MenuItem value="" disabled>
          No users available for the selected organization
        </MenuItem>
      )}
    </Select>
  </FormControl>
</Grid>
}
          
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="product">Product Name</InputLabel>
              <Select
                name="product"
                id="product"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              >
                <MenuItem value="Ecommerce">
                  Ecommerce
                </MenuItem>
                <MenuItem value="Employee management system">
                  Employee management system
                </MenuItem>
                <MenuItem value="HR management system">
                  HR management system
                </MenuItem>
                <MenuItem value="CMS">
                  CMS
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {
          userRole &&
          allowedRoles.includes(userRole) && 
        
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="priority">Priority</InputLabel>
              <Select
                name="priority"
                id="priority"
                value={priority}
                onChange={handleInputChange}
              >
                 <MenuItem value="">
                  Select One
                </MenuItem>
                <MenuItem value="High">
                  High
                </MenuItem>
                <MenuItem value="Low">
                  Low
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="issueType">Issue Type</InputLabel>
              <Select
                name="issueType"
                id="issueType"
                value={issueType}
                onChange={handleInputChange}
              >
                <MenuItem value="">
                  Select One
                </MenuItem>
                {issues && issues.length > 0 ? (
                  issues.map((issue) => (
                    <MenuItem key={issue._id} value={issue._id}>
                      {issue.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    No issue available
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description of the issue"
              name="description"
              placeholder="Description"
              value={description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={4}
            />
          </Grid>
          <Grid item xs={12}>
            <div className="form-outline mb-4">
              <input
                onChange={handleMedia}
                type="file"
                id="formupload"
                name="media"
                className="form-control"
                accept="image/*, video/*"
                multiple
              />
              <label className="form-label" htmlFor="formupload">
                Upload Media (Images and Videos)
              </label>
            </div>
            {media.length > 0 && (
              <div className="selected-media">
                <Typography variant="body2" gutterBottom>
                  Selected Media:
                </Typography>
                <div className="media-items-container">
                  {media.map((mediaItem, index) => (
                    <div key={index} className="media-item">
                      {mediaItem.startsWith("data:image") ? (
                        <img
                        className="img-preview max-w-full max-h-32" // Adjust the max height as needed
                        src={mediaItem}
                        alt={`Selected Image ${index + 1}`}
                      />
                      ) : (
                        <video
                        controls
                        className="video-preview max-w-full max-h-32" // Adjust the max height as needed
                        src={mediaItem}
                        alt={`Selected Video ${index + 1}`}
                      />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Grid>
          {/*
          <Grid item xs={12}>
            <div className="form-outline mb-4">
              <input
                onChange={handleInputChange}
                type="file"
                id="formupload"
                name="media"
                className="form-control"
                accept="image/*, video/*"
                multiple
              />
              <label className="form-label" htmlFor="formupload">
                Upload Media (Images and Videos)
              </label>
            </div>
            {media.length > 0 && (
              <div className="selected-media">
                <Typography variant="body2" gutterBottom>
                  Selected Media:
                </Typography>
                <div className="media-items-container">
                  {media.map((mediaItem, index) => (
                    <div key={index} className="media-item">
                      {mediaItem.startsWith("data:image") ? (
                        <img
                          className="img-preview max-w-full max-h-32"
                          src={mediaItem}
                          alt={`Selected Image ${index + 1}`}
                        />
                      ) : (
                        <video
                          controls
                          className="video-preview max-w-full max-h-32"
                          src={mediaItem}
                          alt={`Selected Video ${index + 1}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Grid>
                      *
        </Grid>
        <div className="form-group mt-6">
          <Button variant="contained" color="primary" fullWidth type="submit">
            Submit
          </Button>
        </div>
      </form>
    </>
  );
}

export default NewTicket;
*/ /*

/*
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createTicket, reset } from "../features/tickets/ticketSlice";
import { fetchAllUsers } from "../features/auth/authSlice";
import Spinner from "../components/Spinner";
import BackButton from "../components/BackButton";
import {
  Button,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Alert,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import CloseIcon from "@mui/icons-material/Close";
import { getAllOrganization } from "../features/organization/organizationSlice";
import { getAllIssueTypes } from "../features/issues/issueSlice";

function NewTicket() {
  const { user } = useSelector((state) => state.auth);
  const { isLoading, isError,  message, isSuccess } = useSelector(
    (state) => state.tickets
  );
 
  const users = useSelector((state) => state.auth.users);
  const issues = useSelector((state) => state.issueTypes.issueTypes);
  const organizations = useSelector((state) => state.organizations.organizations);

  const [title, setTitle] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [customerContact, setCustomerContact] = useState("");
  const [product, setProduct] = useState("");
  const [priority, setPriority] = useState("");
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [media, setMedia] = useState([]);
  const [organization, setOrganization] = useState("");
  const [showAlert, setShowAlert] = useState(false); // For empty form alert

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAllUsers());
    dispatch(getAllOrganization());
    dispatch(getAllIssueTypes());
  }, [dispatch]);

  const handleMedia = (e) => {
    const selectedMedia = e.target.files;
    const mediaArray = [];

    for (let i = 0; i < selectedMedia.length; i++) {
      const file = selectedMedia[i];
      setFileToBase(file, (base64Media) => {
        mediaArray.push(base64Media);

        if (i === selectedMedia.length - 1) {
          setMedia(mediaArray);
        }
      });
    }
  };

  const setFileToBase = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64Media = reader.result;
      callback(base64Media);
    };
  };
  
  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    if (isSuccess) {
      dispatch(reset());
      navigate('/ticketss');
      toast.success('New ticket created!');
      
    }
    
  }, [dispatch, isError, isSuccess, navigate, message, reset]);
  
  const onSubmit = (e, status) => {
    e.preventDefault();
   

    const ticketData = {
      product,
      media,
      description,
      priority,
      assignedTo,
      issueType,
      customerName,
      customerEmail,
      customerContact,
      organization,
      title,
      status: status === "draft" ? "draft" : "new",
    };
    console.log(ticketData)
    dispatch(createTicket(ticketData));
  };
  const userRole = useSelector((state) => state.auth.user?.role);

  // Define an array of roles that should see the "Dashboard" link
  const allowedRoles = ["ADMIN", "SUPERVISOR"];

  const allowedRolesReview = ["ADMIN", "SUPERVISOR","ORGAGENT"];

  if (isLoading) return <Spinner />;

  return (
    <>
      <BackButton url="/" />
      <section className="flex items-center justify-center ">
    
          <div>
            <Typography variant="h4" component="h1" gutterBottom>
              Create New Ticket
            </Typography>
            <Typography variant="body2">
              Please fill out the form below
            </Typography>
          </div>
         
        
      </section>

      <form onSubmit={onSubmit} className="p-6">


        <Grid container spacing={3}>
        <Grid item xs={12}>
            <TextField
              label=" Ticket title"
              placeholder="Ticket title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Customer Name"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Customer Email"
              placeholder="Customer Email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Customer Contact"
              placeholder="Customer Contact"
              value={customerContact}
              onChange={(e) => setCustomerContact(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="organization">Organization</InputLabel>
              <Select
                name="organization"
                id="organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              >
                <MenuItem value="">
                  Select One
                </MenuItem>
                {organizations && organizations.length > 0 ? (
                  organizations.map((organization) => (
                    <MenuItem key={organization._id} value={organization._id}>
                      {organization.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    No organization available
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          {
          userRole &&
          allowedRoles.includes(userRole) && 
        
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="assignedTo">Assign To</InputLabel>
              <Select
                name="assignedTo"
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <MenuItem value="">
                  Select One
                </MenuItem>
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    No users available
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
}
          
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="product">Product Name</InputLabel>
              <Select
                name="product"
                id="product"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              >
                <MenuItem value="Ecommerce">
                  Ecommerce
                </MenuItem>
                <MenuItem value="Employee management system">
                  Employee management system
                </MenuItem>
                <MenuItem value="HR management system">
                  HR management system
                </MenuItem>
                <MenuItem value="CMS">
                  CMS
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {
          userRole &&
          allowedRoles.includes(userRole) && 
        
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="priority">Priority</InputLabel>
              <Select
                name="priority"
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                 <MenuItem value="">
                  Select One
                </MenuItem>
                <MenuItem value="High">
                  High
                </MenuItem>
                <MenuItem value="Low">
                  Low
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="issueType">Issue Type</InputLabel>
              <Select
                name="issueType"
                id="issueType"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
              >
                <MenuItem value="">
                  Select One
                </MenuItem>
                {issues && issues.length > 0 ? (
                  issues.map((issue) => (
                    <MenuItem key={issue._id} value={issue._id}>
                      {issue.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    No issue available
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description of the issue"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
            />
          </Grid>
          <Grid item xs={12}>
            <div className="form-outline mb-4">
              <input
                onChange={handleMedia}
                type="file"
                id="formupload"
                name="media"
                className="form-control"
                accept="image/*, video/*"
                multiple
              />
              <label className="form-label" htmlFor="formupload">
                Upload Media (Images and Videos)
              </label>
            </div>
            {media.length > 0 && (
              <div className="selected-media">
                <Typography variant="body2" gutterBottom>
                  Selected Media:
                </Typography>
                <div className="media-items-container">
                  {media.map((mediaItem, index) => (
                    <div key={index} className="media-item">
                      {mediaItem.startsWith("data:image") ? (
                        <img
                        className="img-preview max-w-full max-h-32" // Adjust the max height as needed
                        src={mediaItem}
                        alt={`Selected Image ${index + 1}`}
                      />
                      ) : (
                        <video
                        controls
                        className="video-preview max-w-full max-h-32" // Adjust the max height as needed
                        src={mediaItem}
                        alt={`Selected Video ${index + 1}`}
                      />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Grid>
        </Grid>
        <div className="form-group mt-6">
        <Button
  variant="contained"
  color="primary"
  onClick={(e) => onSubmit(e, "new")}
>
  Submit 
</Button>
<Button
  variant="contained"
  color="secondary"
  onClick={(e) => onSubmit(e, "draft")}
>
  Save as Draft
</Button>

        </div>
      </form>
    </>
  );
}

export default NewTicket;

*/
/*
import React,{ useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createTicket, reset } from "../features/tickets/ticketSlice";
import { fetchAllUsers } from "../features/auth/authSlice";
import Spinner from "../components/Spinner";
import BackButton from "../components/BackButton";
import { getAllIssueTypes } from "../features/issues/issueSlice";
import { getAllOrganization } from "../features/organization/organizationSlice";

function NewTicket() {
  const { user } = useSelector((state) => state.auth);
  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.tickets
  );
  const users = useSelector((state) => state.auth.users);
  const issues = useSelector((state) => state.issueTypes.issueTypes);
  const organizations = useSelector((state) => state.organizations.organizations);

  const [name] = useState(user.name);
  const [email] = useState(user.email);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [customerContact, setCustomerContact] = useState("");
  const [product, setProduct] = useState("Ecommerce");
  const [priority, setPriority] = useState("High");
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [media, setMedia] = useState([]);
  const [organization, setOrganization ] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the list of registered users when the component loads
    dispatch(fetchAllUsers());
    // Load the initial issue list when the component mounts
    dispatch(getAllIssueTypes());
    dispatch(getAllOrganization());
  }, [dispatch]);

  const handleMedia = (e) => {
    const selectedMedia = e.target.files;
    const mediaArray = [];

    for (let i = 0; i < selectedMedia.length; i++) {
      const file = selectedMedia[i];
      setFileToBase(file, (base64Media) => {
        mediaArray.push(base64Media);

        if (i === selectedMedia.length - 1) {
          setMedia(mediaArray);
        }
      });
    }
  };

  const setFileToBase = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64Media = reader.result;
      callback(base64Media);
    };
  };

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    if (isSuccess) {
     
     
      dispatch(reset());
    }
  }, [dispatch, isError, isSuccess, navigate, message]);

  const onSubmit = (e) => {
    e.preventDefault();
  //  if (!isEmailValid) {
      // Email is not valid, display an error or take appropriate action
  //    toast.error("Please enter a valid email address.");
   //   return;
  //  }

    const ticketData = {
      product,
      media, // Include the images array
      description,
      priority,
      assignedTo,
      issueType,
      customerName,
      customerEmail,
      customerContact,
      organization
    };
    console.log(ticketData)
    dispatch(createTicket(ticketData));
  };
/*
  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    setIsEmailValid(emailPattern.test(email));
  };
*/
/*
  if (isLoading) return <Spinner />;

  return (
    <>
      <BackButton url="/" />
      <section className="heading">
        <h1>Create New Ticket</h1>
        <p>Please fill out the form below</p>
      </section>

      <section className="form">
        <div className="form-group">
          <label htmlFor="name">Creators Name</label>
          <input type="text" className="form-control" value={name} disabled />
        </div>
      </section>

      <section className="form">
        <div className="form-group">
          <label htmlFor="name">Creators Email</label>
          <input type="text" className="form-control" value={email} disabled />
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="customerName">Customer Name</label>
            <input
              className="form-control"
              placeholder="customerName"
              value={customerName}
              name="customerName"
              id="customerName"
              onChange={(e) => setCustomerName(e.target.value)}
            ></input>
          </div>
          <div className="form-group"/*className={`form-group ${isEmailValid ? "valid" : "invalid"}`}*/
          /*
            <label htmlFor="customerEmail">Customer Email</label>
            <input
              className="form-control"
              placeholder="customerEmail"
              value={customerEmail}
              name="customerEmail"
              id="customerEmail"
              onChange={(e) => {
                setCustomerEmail(e.target.value);
                //validateEmail(e.target.value);
              }}
            />
           {/* {isEmailValid ? null : (
              <p className="error-message">
                Please enter a valid email address.
              </p>
           )}*/ /*
          </div>

          <div className="form-group">
            <label htmlFor="customerContact">Customer Contact</label>
            <input
              className="form-control"
              placeholder="customerContact"
              value={customerContact}
              name="customerContact"
              id="customerContact"
              onChange={(e) => setCustomerContact(e.target.value)}
            ></input>
          </div>
          <div className="form-group">
            <label htmlFor="organization">Organization</label>
            <select
              name="organization"
              id="organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
            >
              <option value="">Select One</option>
              {organizations && organizations.length > 0 ? (
                organizations.map((organization) => (
                  <option key={organization._id} value={organization._id}>
                    {organization.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No organization available
                </option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="assignedTo">Assign To</label>
            <select
              name="assignedTo"
              id="assignedTo"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Select One</option>
              {users && users.length > 0 ? (
                users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No users available
                </option>
              )}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="product">Product Name</label>
            <select
              name="product"
              id="product"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            >
              <option value="Ecommernce">Ecommerce</option>
              <option value="Employee management system">
                Employee management system
              </option>
              <option value="HR management system">HR management system</option>
              <option value="CMS">CMS</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              name="priority"
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="High">High</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="issueType">Issue Type</label>
            <select
              name="issueType"
              id="issueType"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
            >
              <option value="">Select One</option>
              {issues && issues.length > 0 ? (
                issues.map((issue) => (
                  <option key={issue._id} value={issue._id}>
                    {issue.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No issue available
                </option>
              )}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="description">Description of the issue</label>
            <textarea
              className="form-control"
              placeholder="Description"
              value={description}
              name="description"
              id="description"
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className="form-group">
            <div className="form-outline mb-4">
              <input
                onChange={handleMedia}
                type="file"
                id="formupload"
                name="media"
                className="form-control"
                multiple // Allow multiple file selection
              />
              <label className="form-label" htmlFor="formupload">
                Media (Images and Videos)
              </label>
            </div>
            {media.length > 0 && (
              <div className="selected-media">
                <div className="media-items-container">
                  {media.map((mediaItem, index) => (
                    <div key={index} className="media-item">
                      {mediaItem.startsWith("data:image") ? (
                        <img
                          className="img-fluid"
                          src={mediaItem}
                          alt={`Selected Image ${index + 1}`}
                          style={{ maxWidth: "100px", maxHeight: "100px" }} // Adjust the dimensions as needed
                        />
                      ) : (
                        <video
                          controls
                          className="video-fluid"
                          src={mediaItem}
                          alt={`Selected Video ${index + 1}`}
                          style={{ maxWidth: "100px", maxHeight: "100px" }} // Adjust the dimensions as needed
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <button  className="btn btn-block">Submit</button>
          </div>
        </form>
      </section>
    </>
  );
}

export default NewTicket;

*/
